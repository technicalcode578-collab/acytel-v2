"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const multer_1 = __importDefault(require("multer"));
const auth_middleware_1 = require("../middleware/auth.middleware");
const track_controller_1 = require("../controllers/track.controller");
const router = (0, express_1.Router)();
// Configure multer with a 50MB file size limit
const upload = (0, multer_1.default)({
    storage: multer_1.default.memoryStorage(),
    limits: { fileSize: 50 * 1024 * 1024 } // 50 MB
});
// GET /api/tracks - Get all tracks for the authenticated user
router.get('/', auth_middleware_1.authenticateToken, track_controller_1.listTracks);
// GET /api/tracks/search - Search for tracks for the authenticated user
router.get('/search', auth_middleware_1.authenticateToken, track_controller_1.searchTracks);
// GET /api/tracks/:trackId/secure-link - Generate a temporary streaming URL
router.get('/:trackId/secure-link', auth_middleware_1.authenticateToken, track_controller_1.generateSecureStreamLink);
// GET /api/tracks/:trackId/stream - The actual streaming endpoint
router.get('/:trackId/stream', auth_middleware_1.verifyStreamToken, track_controller_1.streamTrack);
// POST /api/tracks/upload - Upload a new track
router.post('/upload', auth_middleware_1.authenticateToken, upload.single('audioFile'), track_controller_1.uploadTrack);
exports.default = router;
