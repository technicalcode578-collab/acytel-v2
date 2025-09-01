import { Router } from 'express';
import multer from 'multer';
import { authenticateToken, verifyStreamToken } from '../middleware/auth.middleware';
import { uploadTrack, listTracks, streamTrack, generateSecureStreamLink, searchTracks } from '../controllers/track.controller';

const router = Router();

// Configure multer with a 50MB file size limit
const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: { fileSize: 50 * 1024 * 1024 } // 50 MB
});

// GET /api/tracks - Get all tracks for the authenticated user
router.get('/', authenticateToken, listTracks);

// GET /api/tracks/search - Search for tracks for the authenticated user
router.get('/search', authenticateToken, searchTracks);

// GET /api/tracks/:trackId/secure-link - Generate a temporary streaming URL
router.get('/:trackId/secure-link', authenticateToken, generateSecureStreamLink);

// GET /api/tracks/:trackId/stream - The actual streaming endpoint
router.get('/:trackId/stream', verifyStreamToken, streamTrack);
// POST /api/tracks/upload - Upload a new track
router.post('/upload', authenticateToken, upload.single('audioFile'), uploadTrack);

export default router;