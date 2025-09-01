use axum::{
    body::Body,
    extract::{Query, State},
    http::{header, HeaderMap, HeaderValue, Method, StatusCode},
    response::{IntoResponse, Response},
    routing::get,
    Router,
};
use aws_config::BehaviorVersion;
use aws_sdk_s3::Client as S3Client;
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

#[tokio::main]
async fn main() {
    dotenvy::dotenv().expect("Failed to load .env file");

    let aws_config = aws_config::load_defaults(BehaviorVersion::latest()).await;
    let s3_config = aws_sdk_s3::config::Builder::from(&aws_config)
        .endpoint_url(std::env::var("AWS_ENDPOINT_URL").unwrap())
        .force_path_style(true)
        .build();
    let s3_client = S3Client::from_conf(s3_config);

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

#[derive(Clone)]
struct AppState {
    s3_client: S3Client,
}

async fn stream_handler(
    State(state): State<AppState>,
    Query(params): Query<StreamParams>,
    headers: HeaderMap, // Extract request headers
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

    // First, get metadata about the file (like its size) from MinIO
    let head_object = state.s3_client.head_object().bucket(&bucket).key(&key).send().await.map_err(|_| AppError::FileNotFound)?;
    let file_size = head_object.content_length().unwrap_or(0);

    let range = headers
        .get(header::RANGE)
        .and_then(|value| value.to_str().ok());

    let mut response_headers = HeaderMap::new();
    response_headers.insert(header::ACCEPT_RANGES, HeaderValue::from_static("bytes"));
    response_headers.insert(header::CONTENT_TYPE, HeaderValue::from_static("audio/mpeg"));

    let (start, end) = if let Some(range) = range {
        let (start, end) = parse_range(range, file_size).ok_or(AppError::InvalidRange)?;
        (start, end)
    } else {
        (0, file_size - 1)
    };
    
    let range_header = format!("bytes {}-{}/{}", start, end, file_size);
    response_headers.insert(header::CONTENT_RANGE, HeaderValue::from_str(&range_header).unwrap());
    response_headers.insert(header::CONTENT_LENGTH, HeaderValue::from((end - start) + 1));

    let s3_object = state
        .s3_client
        .get_object()
        .bucket(bucket)
        .key(key)
        .range(format!("bytes={}-{}", start, end)) // Request only the specific byte range
        .send()
        .await
        .map_err(|_| AppError::FileNotFound)?;

    let async_read = s3_object.body.into_async_read();
    let stream = ReaderStream::new(async_read);
    let body = Body::from_stream(stream);

    // Use 206 Partial Content for range requests, 200 OK for full requests
    let status_code = if range.is_some() { StatusCode::PARTIAL_CONTENT } else { StatusCode::OK };

    Ok((status_code, response_headers, body).into_response())
}

// Helper function to parse the Range header
fn parse_range(range_header: &str, file_size: i64) -> Option<(i64, i64)> {
    let range = range_header.strip_prefix("bytes=")?.split('-').collect::<Vec<_>>();
    let start = range.get(0)?.parse::<i64>().ok()?;
    let end = range.get(1).and_then(|s| s.parse::<i64>().ok()).unwrap_or(file_size - 1);

    if start > end || end >= file_size {
        None
    } else {
        Some((start, end))
    }
}

enum AppError {
    InvalidToken,
    FileNotFound,
    InvalidRange,
}

impl IntoResponse for AppError {
    fn into_response(self) -> Response {
        let (status, error_message) = match self {
            AppError::InvalidToken => (StatusCode::UNAUTHORIZED, "Invalid or expired token."),
            AppError::FileNotFound => (StatusCode::NOT_FOUND, "File not found."),
            AppError::InvalidRange => (StatusCode::RANGE_NOT_SATISFIABLE, "Invalid range specified."),
        };
        (status, error_message).into_response()
    }
}
