import { Client } from 'cassandra-driver';

console.log('Initializing database client module...');

// These names MUST match what you set in the Render Environment tab
const bundlePath = process.env.ASTRA_SECURE_BUNDLE_PATH;
const username = process.env.ASTRA_DB_USERNAME;
const password = process.env.ASTRA_DB_PASSWORD;
const keyspace = process.env.ASTRA_DB_KEYSPACE;

// Check if all required variables are present
if (!bundlePath || !username || !password || !keyspace) {
    console.error('CRITICAL ERROR: One or more Astra DB environment variables are missing.');
    process.exit(1); // Exit if configuration is incomplete
}

const client = new Client({
    cloud: {
        secureConnectBundle: bundlePath,
    },
    credentials: {
        username: username,
        password: password,
    },
    keyspace: keyspace,
});

console.log('Attempting to connect to the database...');

// Explicitly connect to the database
client.connect().then(() => {
    console.log('SUCCESS: Successfully connected to the database.');
}).catch(err => {
    console.error('FATAL: Database connection failed:', err);
    process.exit(1); // Exit if we can't connect
});

export default client;