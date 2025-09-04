use axum::{
    body::Body,
    extract::{Query, State},
    http::{header, Method, StatusCode},
    response::{IntoResponse, Response},
    routing::get,
    Router,
};
use aws_config::{meta::region::RegionProviderChain, BehaviorVersion};
use aws_sdk_s3::{config::Region, Client as S3Client};
use aws_smithy_runtime::client::http::hyper_014::HyperClientBuilder;
use jsonwebtoken::{decode, DecodingKey, Validation};
use serde::{Deserialize, Serialize};
use std::net::SocketAddr;
use tokio::net::TcpListener;
use tokio_util::io::ReaderStream;
use tower_http::cors::{Any, CorsLayer};

#[derive(Debug, Serialize, Deserialize)]
struct Claims {
    exp: usize,
    storage_path: String,
}

#[derive(Debug, Deserialize)]
struct StreamParams {
    token: String,
}

#[derive(Clone)]
struct AppState {
    s3_client: S3Client,
}

enum AppError {
    InvalidToken,
    FileNotFound,
}

#[tokio::main]
async fn main() {
    dotenvy::dotenv().expect("Failed to load .env file");

    // --- THIS IS THE FINAL, ROBUST S3 CLIENT CONFIGURATION ---
    // It explicitly configures the SDK to work with a local, non-AWS endpoint like MinIO.
    let region_provider = RegionProviderChain::first_try(Region::new("us-east-1"));
    let sdk_config = aws_config::defaults(BehaviorVersion::latest())
        .region(region_provider)
        .http_client(HyperClientBuilder::new().build_https())
        .load()
        .await;

    let s3_config = aws_sdk_s3::config::Builder::from(&sdk_config)
        .endpoint_url(std::env::var("AWS_ENDPOINT_URL").unwrap())
        .force_path_style(true)
        .build();
    let s3_client = S3Client::from_conf(s3_config);
    // --- END OF S3 CONFIGURATION ---

    let app_state = AppState { s3_client };

    let cors = CorsLayer::new()
        .allow_methods([Method::GET])
        .allow_origin(Any);

    let app = Router::new()
        .route("/stream", get(stream_handler))
        .with_state(app_state)
        .layer(cors);

    let addr = SocketAddr::from(([0, 0, 0, 0], 8000));
    println!("🚀 Rust streamer listening on http://{}", addr);

    let listener = TcpListener::bind(addr).await.unwrap();
    axum::serve(listener, app).await.unwrap();
}

async fn stream_handler(
    State(state): State<AppState>,
    Query(params): Query<StreamParams>,
) -> Result<Response, AppError> {
    let secret = std::env::var("STREAM_TOKEN_SECRET").expect("STREAM_TOKEN_SECRET must be set");
    
    let token_data = decode::<Claims>(
        &params.token,
        &DecodingKey::from_secret(secret.as_ref()),
        &Validation::default(),
    )
    .map_err(|_| AppError::InvalidToken)?;

    let bucket = std::env::var("MINIO_BUCKET_NAME").unwrap();
    let key = token_data.claims.storage_path;

    let s3_object = state
        .s3_client
        .get_object()
        .bucket(bucket)
        .key(key)
        .send()
        .await
        .map_err(|_| AppError::FileNotFound)?;

    let headers = [
        (header::CONTENT_TYPE, "audio/mpeg"),
        (header::ACCEPT_RANGES, "bytes"),
    ];
    
    let async_read = s3_object.body.into_async_read();
    let stream = ReaderStream::new(async_read);
    let body = Body::from_stream(stream);

    Ok((StatusCode::OK, headers, body).into_response())
}

// --- Error Handling ---
impl IntoResponse for AppError {
    fn into_response(self) -> Response {
        let (status, error_message) = match self {
            AppError::InvalidToken => (StatusCode::UNAUTHORIZED, "Invalid or expired token."),
            AppError::FileNotFound => (StatusCode::NOT_FOUND, "File not found."),
        };
        (status, error_message).into_response()
    }
}