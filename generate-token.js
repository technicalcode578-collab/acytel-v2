const jwt = require('jsonwebtoken');

// --- Configuration ---
// This now matches the secret in your .env files
const SECRET_KEY = 'hjggggjgagjdfjgajfguyfewyfteqfgabnvbdsjkgfdgfadkjgfakdjfhadkjghakjhqkjafhqfmnsdkvnbdajkvhadukgq';

// TODO: Replace this with a real 'storage_path' of a track from your MinIO bucket.
const STORAGE_PATH = 'c772f1c1-47bb-4417-b5c8-3a73062db3dd.mp3'; 

// How long the token will be valid for (in seconds).
const EXPIRATION_IN_SECONDS = 1800; 

// --- Token Generation Logic ---
const payload = {
  storage_path: STORAGE_PATH,
  exp: Math.floor(Date.now() / 1000) + EXPIRATION_IN_SECONDS,
};

const token = jwt.sign(payload, SECRET_KEY);

console.log('--- Generated JWT for Rust Service ---');
console.log(token);
console.log('\n--- Use this curl command to test ---');
console.log(`curl --output rust-test.mp3 "http://localhost:8000/stream?token=${token}"`);