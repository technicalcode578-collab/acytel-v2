import { Client, DseClientOptions, types } from 'cassandra-driver';

console.log('Initializing database client module...');

// Configuration for our ScyllaDB client
const clientOptions: DseClientOptions = {
    // This must match the service name in our docker-compose.yml
    contactPoints: ['localhost'],
    // This is the default data center for the ScyllaDB docker image
    localDataCenter: 'datacenter1',
    // It's good practice to be explicit about the port
    protocolOptions: { port: 9042 },
    queryOptions: { consistency: types.consistencies.localQuorum }
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