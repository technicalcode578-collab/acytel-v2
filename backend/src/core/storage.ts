import { S3Client } from "@aws-sdk/client-s3";

const s3Client = new S3Client({
    // The endpoint must point to your MinIO container's API port (9000).
    endpoint: "http://localhost:9000",
    // These credentials must match what's in your .env file and docker-compose.
    credentials: {
        accessKeyId: process.env.MINIO_ROOT_USER!,
        secretAccessKey: process.env.MINIO_ROOT_PASSWORD!,
    },
    // This region is arbitrary for local MinIO but required by the SDK.
    region: "us-east-1",
    // This setting is CRITICAL for MinIO to work correctly.
    forcePathStyle: true,
    maxAttempts: 1,
});

export default s3Client;