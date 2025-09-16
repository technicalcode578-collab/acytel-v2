"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.typesenseClient = void 0;
const typesense_1 = require("typesense");
const apiKey = process.env.TYPESENSE_API_KEY;
const host = process.env.TYPESENSE_HOST;
const port = process.env.TYPESENSE_PORT || '443'; // Default to 443 if not set
const protocol = process.env.TYPESENSE_PROTOCOL || 'https'; // Default to https if not set
if (!apiKey || !host) {
    throw new Error('TYPESENSE_API_KEY or TYPESENSE_HOST environment variables are not defined');
}
exports.typesenseClient = new typesense_1.Client({
    nodes: [
        {
            host: host,
            port: parseInt(port, 10), // Convert port from string to number
            protocol: protocol,
        },
    ],
    apiKey: apiKey,
    connectionTimeoutSeconds: 5, // Increased timeout for cloud services
});
