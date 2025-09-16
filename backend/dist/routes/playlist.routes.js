"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_middleware_1 = require("../middleware/auth.middleware");
const playlist_controller_1 = require("../controllers/playlist.controller");
const router = (0, express_1.Router)();
// Apply authentication middleware to all playlist routes
router.use(auth_middleware_1.authenticateToken);
router.route('/')
    .post(playlist_controller_1.createPlaylist)
    .get(playlist_controller_1.getUserPlaylists);
router.route('/:id')
    .get(playlist_controller_1.getPlaylistById)
    .put(playlist_controller_1.updatePlaylist);
// Routes for managing tracks within a playlist
router.post('/:playlistId/tracks', playlist_controller_1.addTrackToPlaylist);
router.delete('/:playlistId/tracks/:trackId', playlist_controller_1.removeTrackFromPlaylist);
exports.default = router;
