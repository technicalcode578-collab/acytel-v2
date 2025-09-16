import { Client, DseClientOptions } from 'cassandra-driver';
import fs from 'fs';

console.log('Initializing database client module...');

const secureConnectBundlePath = process.env.DB_SECURE_CONNECT_BUNDLE_PATH;
const username = process.env.DB_USERNAME;
const password = process.env.DB_PASSWORD;

console.log('DB_SECURE_CONNECT_BUNDLE_PATH:', secureConnectBundlePath);

if (!secureConnectBundlePath) {
    console.error('Database configuration error: DB_SECURE_CONNECT_BUNDLE_PATH environment variable not set.');
    process.exit(1);
}

if (!username || !password) {
    console.error('Database configuration error: DB_USERNAME or DB_PASSWORD environment variable not set.');
    process.exit(1);
}

// Check if the secure connect bundle file exists
if (fs.existsSync(secureConnectBundlePath)) {
    console.log('Secure connect bundle found at path:', secureConnectBundlePath);
} else {
    console.error('Secure connect bundle not found at path:', secureConnectBundlePath);
    process.exit(1);
}

const clientOptions: DseClientOptions = {
    cloud: {
        secureConnectBundle: secureConnectBundlePath,
    },
    credentials: {
        username: username,
        password: password,
    },
};

const client = new Client(clientOptions);

// This event listener is a vital diagnostic tool. It will report
// connection warnings and errors directly to our console.
client.on('log', (level, className, message) => {
    if (level === 'warning' || level === 'error') {
        console.log(`[DB LOG] ${level}: ${className} | ${message}`);
    }
});

// Explicitly connect to the database
console.log('Attempting to connect to the database...');
client.connect().then(() => {
    console.log('Successfully connected to the database.');
}).catch(err => {
    console.error('FATAL: Database connection failed:', err);
    process.exit(1); // Exit if we can't connect
});

// We export the single client instance for use across the application.
export default client;
