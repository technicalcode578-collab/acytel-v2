import 'dotenv/config';
import express, { Request, Response } from 'express'; // We no longer need 'json' from here
import cors from 'cors';
import { json as bodyParserJson } from 'body-parser'; // Import the parser from body-parser

import authRouter from './routes/auth.routes';
import userRouter from './routes/user.routes';
import trackRouter from './routes/track.routes';
import playlistRouter from './routes/playlist.routes';
import { initializeTrackCollection } from './services/search.service';

const app = express();
const PORT = process.env.PORT || 3000;

const corsOptions = {
  origin: process.env.CORS_ORIGIN
};

// --- Middleware Setup ---
// This MUST come BEFORE your app.use('/api/...') routes
app.use(cors(corsOptions));
app.use(bodyParserJson()); // Use the body-parser middleware

// --- API Routes ---
app.use('/api/auth', authRouter);
app.use('/api/users', userRouter);
app.use('/api/tracks', trackRouter);
app.use('/api/playlists', playlistRouter);

// --- Server Listener ---
initializeTrackCollection().catch(console.error);
app.listen(PORT, () => {
  console.log(`Acytel backend server running on http://localhost:${PORT}`);
});