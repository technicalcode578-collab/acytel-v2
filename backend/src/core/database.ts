import { Client } from 'cassandra-driver';

console.log('Initializing database client module...');

// These names MUST match what you set in the Render Environment tab
const bundleBase64 = process.env.ASTRA_SECURE_BUNDLE_BASE64;
const username = process.env.ASTRA_DB_USERNAME;
const password = process.env.ASTRA_DB_PASSWORD;
const keyspace = process.env.ASTRA_DB_KEYSPACE;

if (!bundleBase64 || !username || !password || !keyspace) {
    console.error('CRITICAL ERROR: One or more Astra DB environment variables are missing for Base64 method.');
    process.exit(1);
}

console.log('Decoding Base64 bundle and attempting to connect...');

// Decode the Base64 string from the environment variable back into a binary buffer
const bundleBuffer = Buffer.from(bundleBase64, 'base64');

const client = new Client({
    cloud: {
        // Provide the decoded buffer directly, bypassing the file system
        secureConnectBundle: bundleBuffer as any,
    },
    credentials: {
        username: username,
        password: password,
    },
    keyspace: keyspace,
});

client.connect()
    .then(() => {
        console.log('SUCCESS: Successfully connected to Astra DB using Base64 bundle!');
    })
    .catch(err => {
        console.error('FATAL: Database connection failed:', err);
        process.exit(1);
    });

export default client;