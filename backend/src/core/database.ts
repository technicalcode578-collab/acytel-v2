import { Client } from 'cassandra-driver';
import * as fs from 'fs';
import * as path from 'path';

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

console.log('Decoding Base64 bundle and creating temporary file...');

// Decode the Base64 string and write it to a temporary file
const bundleBuffer = Buffer.from(bundleBase64, 'base64');
const tempBundlePath = path.join(__dirname, 'secure-connect-bundle.zip');

try {
    fs.writeFileSync(tempBundlePath, bundleBuffer);
    console.log('Temporary bundle file created successfully');
} catch (error) {
    console.error('Failed to create temporary bundle file:', error);
    process.exit(1);
}

const client = new Client({
    cloud: {
        // Pass the file path as a string, not a buffer
        secureConnectBundle: tempBundlePath,
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

// Clean up the temporary file on process exit
process.on('exit', () => {
    try {
        if (fs.existsSync(tempBundlePath)) {
            fs.unlinkSync(tempBundlePath);
            console.log('Temporary bundle file cleaned up');
        }
    } catch (error) {
        console.warn('Failed to clean up temporary file:', error);
    }
});

process.on('SIGINT', () => process.exit(0));
process.on('SIGTERM', () => process.exit(0));

export default client;