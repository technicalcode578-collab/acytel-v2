"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const cassandra_driver_1 = require("cassandra-driver");
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
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
}
catch (error) {
    console.error('Failed to create temporary bundle file:', error);
    process.exit(1);
}
const client = new cassandra_driver_1.Client({
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
    }
    catch (error) {
        console.warn('Failed to clean up temporary file:', error);
    }
});
process.on('SIGINT', () => process.exit(0));
process.on('SIGTERM', () => process.exit(0));
exports.default = client;
