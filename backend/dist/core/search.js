"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.typesenseClient = void 0;
const typesense_1 = require("typesense");
if (!process.env.TYPESENSE_API_KEY) {
    throw new Error('TYPESENSE_API_KEY is not defined');
}
exports.typesenseClient = new typesense_1.Client({
    nodes: [
        {
            host: 'localhost',
            port: 8108,
            protocol: 'http',
        },
    ],
    apiKey: process.env.TYPESENSE_API_KEY,
    connectionTimeoutSeconds: 2,
});
