import { Client, DseClientOptions, types, auth } from 'cassandra-driver';

console.log('Initializing database client module...');

// Log environment variables for debugging
console.log('DB_CONTACT_POINTS:', process.env.DB_CONTACT_POINTS);
console.log('DB_LOCAL_DATACENTER:', process.env.DB_LOCAL_DATACENTER);
console.log('DB_USERNAME:', process.env.DB_USERNAME ? 'found' : 'not found');
console.log('DB_PASSWORD:', process.env.DB_PASSWORD ? 'found' : 'not found');

// Configuration for our ScyllaDB client
const contactPoints = process.env.DB_CONTACT_POINTS?.split(',') || ['localhost'];
const localDataCenter = process.env.DB_LOCAL_DATACENTER || 'datacenter1';
const username = process.env.DB_USERNAME;
const password = process.env.DB_PASSWORD;

const authProvider = (username && password) 
  ? new auth.PlainTextAuthProvider(username, password) 
  : undefined;

const clientOptions: DseClientOptions = {
    contactPoints: contactPoints,
    localDataCenter: localDataCenter,
    protocolOptions: { port: 9042 },
    queryOptions: { consistency: types.consistencies.localQuorum },
    authProvider: authProvider
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
client.connect().then(() => {
    console.log('Successfully connected to the database.');
}).catch(err => {
    console.error('Database connection failed:', err); 
    process.exit(1); // Exit if we can't connect
});

// We export the single client instance for use across the application.
export default client;