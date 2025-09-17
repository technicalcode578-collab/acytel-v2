import { Router } from 'express';
import multer from 'multer';
import { authenticateToken, verifyStreamToken } from '../middleware/auth.middleware';
import {
  uploadTrack,
  listMyTracks,
  streamTrack,
  generateSecureStreamLink,
  searchPublicTracks,
  getPublicTracks,
  deleteTrack
} from '../controllers/track.controller';

const router = Router();

const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: { fileSize: 50 * 1024 * 1024 } // 50 MB
});

// Public routes (no authentication required)
router.get('/public', getPublicTracks);
router.get('/public/search', searchPublicTracks);

// Authenticated routes
router.get('/me', authenticateToken, listMyTracks);
router.post('/upload', authenticateToken, upload.single('audioFile'), uploadTrack);
router.delete('/:trackId', authenticateToken, deleteTrack);

// Streaming routes
router.get('/:trackId/secure-link', authenticateToken, generateSecureStreamLink);
router.get('/:trackId/stream', verifyStreamToken, streamTrack);

export default router;
