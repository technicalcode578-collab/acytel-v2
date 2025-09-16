"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createPlaylist = createPlaylist;
exports.getUserPlaylists = getUserPlaylists;
exports.updatePlaylist = updatePlaylist;
exports.getPlaylistById = getPlaylistById;
exports.addTrackToPlaylist = addTrackToPlaylist;
exports.removeTrackFromPlaylist = removeTrackFromPlaylist;
const zod_1 = require("zod");
const uuid_1 = require("uuid");
const database_1 = __importDefault(require("../core/database"));
const cassandra_driver_1 = require("cassandra-driver");
// --- Zod Schemas for Validation ---
const createPlaylistSchema = zod_1.z.object({
    name: zod_1.z.string().min(1, 'Playlist name cannot be empty.'),
    description: zod_1.z.string().optional(),
});
const updatePlaylistSchema = zod_1.z.object({
    name: zod_1.z.string().min(1, 'Playlist name cannot be empty.').optional(),
    description: zod_1.z.string().optional(),
});
const addTrackSchema = zod_1.z.object({
    trackId: zod_1.z.string().uuid('Invalid Track ID format.'),
});
// --- Helper Function ---
async function getPlaylistAndVerifyOwnership(playlistId, ownerId) {
    const query = 'SELECT * FROM acytel.playlists WHERE id = ? LIMIT 1';
    const result = await database_1.default.execute(query, [playlistId], { prepare: true });
    const playlist = result.first();
    if (!playlist)
        return null;
    if (playlist.owner_id.toString() !== ownerId)
        throw new Error('FORBIDDEN');
    return playlist;
}
// --- Controller Functions ---
async function createPlaylist(req, res) {
    try {
        const { name, description } = createPlaylistSchema.parse(req.body);
        const ownerId = req.user.id;
        const newPlaylistId = (0, uuid_1.v4)();
        const query = 'INSERT INTO acytel.playlists (id, owner_id, name, description, track_ids, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?)';
        const params = [newPlaylistId, ownerId, name, description || null, [], new Date(), new Date()];
        await database_1.default.execute(query, params, { prepare: true });
        const createdPlaylist = {
            id: newPlaylistId,
            owner_id: ownerId,
            name,
            description: description || null,
            track_ids: [],
            created_at: new Date(),
            updated_at: new Date(),
        };
        res.status(201).json(createdPlaylist);
    }
    catch (error) {
        if (error instanceof zod_1.z.ZodError) {
            return res.status(400).json({ message: 'Invalid input.', issues: error.issues });
        }
        console.error('Create playlist error:', error);
        res.status(500).json({ message: 'Internal server error.' });
    }
}
async function getUserPlaylists(req, res) {
    try {
        const ownerId = req.user.id;
        const query = 'SELECT * FROM acytel.playlists WHERE owner_id = ?';
        const result = await database_1.default.execute(query, [ownerId], { prepare: true });
        res.status(200).json(result.rows);
    }
    catch (error) {
        console.error('Get user playlists error:', error);
        res.status(500).json({ message: 'Internal server error.' });
    }
}
async function updatePlaylist(req, res) { }
/**
 * Retrieves a single playlist by its ID and "hydrates" it with full track objects.
 */
async function getPlaylistById(req, res) {
    try {
        const { id } = req.params;
        const ownerId = req.user.id;
        const playlist = await getPlaylistAndVerifyOwnership(id, ownerId);
        if (!playlist) {
            return res.status(404).json({ message: 'Playlist not found.' });
        }
        // Hydration Step
        if (playlist.track_ids && playlist.track_ids.length > 0) {
            const trackQuery = 'SELECT * FROM acytel.tracks WHERE id IN ?';
            const trackResult = await database_1.default.execute(trackQuery, [playlist.track_ids], { prepare: true });
            // Replace the IDs with the full track objects
            playlist.tracks = trackResult.rows;
        }
        else {
            playlist.tracks = [];
        }
        delete playlist.track_ids; // Remove the redundant list of IDs
        res.status(200).json(playlist);
    }
    catch (error) {
        if (error.message === 'FORBIDDEN') {
            return res.status(403).json({ message: 'Forbidden: You do not own this playlist.' });
        }
        console.error('Get playlist by ID error:', error);
        res.status(500).json({ message: 'Internal server error.' });
    }
}
/**
 * Adds a track to a playlist.
 */
async function addTrackToPlaylist(req, res) {
    try {
        const { playlistId } = req.params;
        const { trackId } = addTrackSchema.parse(req.body);
        const ownerId = req.user.id;
        const playlist = await getPlaylistAndVerifyOwnership(playlistId, ownerId);
        if (!playlist) {
            return res.status(404).json({ message: 'Playlist not found.' });
        }
        const trackIds = playlist.track_ids || [];
        // Prevent duplicates
        if (trackIds.some(id => id.toString() === trackId)) {
            return res.status(409).json({ message: 'Track already exists in this playlist.' });
        }
        const newTrackIds = [...trackIds, cassandra_driver_1.types.Uuid.fromString(trackId)];
        const query = 'UPDATE acytel.playlists SET track_ids = ?, updated_at = ? WHERE id = ?';
        await database_1.default.execute(query, [newTrackIds, new Date(), playlistId], { prepare: true });
        res.status(200).json({ message: 'Track added to playlist.' });
    }
    catch (error) {
        if (error instanceof zod_1.z.ZodError) {
            return res.status(400).json({ message: 'Invalid input.', issues: error.issues });
        }
        if (error.message === 'FORBIDDEN') {
            return res.status(403).json({ message: 'Forbidden: You do not own this playlist.' });
        }
        console.error('Add track to playlist error:', error);
        res.status(500).json({ message: 'Internal server error.' });
    }
}
/**
 * Removes a track from a playlist.
 */
async function removeTrackFromPlaylist(req, res) {
    try {
        const { playlistId, trackId } = req.params;
        const ownerId = req.user.id;
        const playlist = await getPlaylistAndVerifyOwnership(playlistId, ownerId);
        if (!playlist) {
            return res.status(404).json({ message: 'Playlist not found.' });
        }
        const trackIds = playlist.track_ids || [];
        const newTrackIds = trackIds.filter(id => id.toString() !== trackId);
        if (newTrackIds.length === trackIds.length) {
            return res.status(404).json({ message: 'Track not found in this playlist.' });
        }
        const query = 'UPDATE acytel.playlists SET track_ids = ?, updated_at = ? WHERE id = ?';
        await database_1.default.execute(query, [newTrackIds, new Date(), playlistId], { prepare: true });
        res.status(200).json({ message: 'Track removed from playlist.' });
    }
    catch (error) {
        if (error.message === 'FORBIDDEN') {
            return res.status(403).json({ message: 'Forbidden: You do not own this playlist.' });
        }
        console.error('Remove track from playlist error:', error);
        res.status(500).json({ message: 'Internal server error.' });
    }
}
