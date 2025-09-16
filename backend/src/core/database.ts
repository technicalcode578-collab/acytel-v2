import { Client } from 'cassandra-driver';
import * as fs from 'fs';
import * as path from 'path';

console.log('Initializing database client module...');

// These names MUST match what you set in the Render Environment tab
const bundlePath = process.env.ASTRA_SECURE_BUNDLE_PATH;
const username = process.env.ASTRA_DB_USERNAME;
const password = process.env.ASTRA_DB_PASSWORD;
const keyspace = process.env.ASTRA_DB_KEYSPACE;

// Check if all required variables are present
if (!bundlePath || !username || !password || !keyspace) {
    console.error('CRITICAL ERROR: One or more Astra DB environment variables are missing.');
    process.exit(1);
}

// Verify the bundle file exists and is readable
try {
    const resolvedPath = path.resolve(bundlePath);
    console.log('Checking bundle file at:', resolvedPath);
    
    if (!fs.existsSync(resolvedPath)) {
        console.error('CRITICAL ERROR: Secure connect bundle file does not exist at:', resolvedPath);
        process.exit(1);
    }
    
    const stats = fs.statSync(resolvedPath);
    console.log('Bundle file size:', stats.size, 'bytes');
    
    if (stats.size === 0) {
        console.error('CRITICAL ERROR: Secure connect bundle file is empty');
        process.exit(1);
    }
    
} catch (error) {
    console.error('CRITICAL ERROR: Cannot read secure connect bundle file:', error);
    process.exit(1);
}

const client = new Client({
    cloud: {
        secureConnectBundle: bundlePath,
    },
    credentials: {
        username: username,
        password: password,
    },
    keyspace: keyspace
});

console.log('Attempting to connect to the database...');

// Explicitly connect to the database
client.connect()
    .then(() => {
        console.log('SUCCESS: Successfully connected to Astra DB');
    })
    .catch(err => {
        console.error('FATAL: Database connection failed');
        console.error('Error message:', err.message);
        if (err.message.includes('ADM-ZIP')) {
            console.error('TROUBLESHOOTING: The bundle file appears valid but could not be parsed. Please re-download a fresh copy from Astra and update the Secret File on Render.');
        }
        process.exit(1);
    });

export default client;