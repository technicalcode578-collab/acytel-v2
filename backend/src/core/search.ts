import { Client } from 'typesense';

if (!process.env.TYPESENSE_API_KEY) {
  throw new Error('TYPESENSE_API_KEY is not defined');
}

export const typesenseClient = new Client({
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
