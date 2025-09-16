        import { Request, Response } from 'express';
        import { z } from 'zod';
        import { v4 as uuidv4 } from 'uuid';
        import dbClient from '../core/database';
        import { types } from 'cassandra-driver';

        // --- Zod Schemas for Validation ---
        const createPlaylistSchema = z.object({
          name: z.string().min(1, 'Playlist name cannot be empty.'),
          description: z.string().optional(),
        });

        const updatePlaylistSchema = z.object({
          name: z.string().min(1, 'Playlist name cannot be empty.').optional(),
          description: z.string().optional(),
        });

        const addTrackSchema = z.object({
          trackId: z.string().uuid('Invalid Track ID format.'),
        });

        // --- Helper Function ---
        async function getPlaylistAndVerifyOwnership(playlistId: string, ownerId: string) {
            const query = 'SELECT * FROM playlists WHERE id = ? LIMIT 1';
            const result = await dbClient.execute(query, [playlistId], { prepare: true });
            const playlist = result.first();

            if (!playlist) return null;
            if (playlist.owner_id.toString() !== ownerId) throw new Error('FORBIDDEN');
            
            return playlist;
        }

        // --- Controller Functions ---

                export async function createPlaylist(req: Request, res: Response) {
          try {
            const { name, description } = createPlaylistSchema.parse(req.body);
            const ownerId = req.user!.id;
            const newPlaylistId = uuidv4();

            const query = 'INSERT INTO playlists (id, owner_id, name, description, track_ids, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?)';
            const params = [newPlaylistId, ownerId, name, description || null, [], new Date(), new Date()];

            await dbClient.execute(query, params, { prepare: true });

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
        } catch (error: any) {
            if (error instanceof z.ZodError) {
                return res.status(400).json({ message: 'Invalid input.', issues: error.issues });
            }
            console.error('Create playlist error:', error);
            res.status(500).json({ message: 'Internal server error.' });
        }
    }
                export async function getUserPlaylists(req: Request, res: Response) {
            try {
                const ownerId = req.user!.id;
                const query = 'SELECT * FROM playlists WHERE owner_id = ?';
                const result = await dbClient.execute(query, [ownerId], { prepare: true });
                res.status(200).json(result.rows);
            } catch (error: any) {
                console.error('Get user playlists error:', error);
                res.status(500).json({ message: 'Internal server error.' });
            }
        }
        export async function updatePlaylist(req: Request, res: Response) { /* ... same as before ... */ }

        /**
         * Retrieves a single playlist by its ID and "hydrates" it with full track objects.
         */
        export async function getPlaylistById(req: Request, res: Response) {
          try {
            const { id } = req.params;
            const ownerId = req.user!.id;
            const playlist = await getPlaylistAndVerifyOwnership(id, ownerId);

            if (!playlist) {
              return res.status(404).json({ message: 'Playlist not found.' });
            }

            // Hydration Step
            if (playlist.track_ids && playlist.track_ids.length > 0) {
                const trackQuery = 'SELECT * FROM acytel.tracks WHERE id IN ?';
                const trackResult = await dbClient.execute(trackQuery, [playlist.track_ids], { prepare: true });
                // Replace the IDs with the full track objects
                playlist.tracks = trackResult.rows;
            } else {
                playlist.tracks = [];
            }
            delete playlist.track_ids; // Remove the redundant list of IDs

            res.status(200).json(playlist);
          } catch (error: any) {
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
        export async function addTrackToPlaylist(req: Request, res: Response) {
            try {
                const { playlistId } = req.params;
                const { trackId } = addTrackSchema.parse(req.body);
                const ownerId = req.user!.id;

                const playlist = await getPlaylistAndVerifyOwnership(playlistId, ownerId);
                if (!playlist) {
                    return res.status(404).json({ message: 'Playlist not found.' });
                }

                const trackIds: types.Uuid[] = playlist.track_ids || [];
                
                // Prevent duplicates
                if (trackIds.some(id => id.toString() === trackId)) {
                    return res.status(409).json({ message: 'Track already exists in this playlist.' });
                }

                const newTrackIds = [...trackIds, types.Uuid.fromString(trackId)];
                
                const query = 'UPDATE playlists SET track_ids = ?, updated_at = ? WHERE id = ?';
                await dbClient.execute(query, [newTrackIds, new Date(), playlistId], { prepare: true });

                res.status(200).json({ message: 'Track added to playlist.' });
            } catch (error: any) {
                 if (error instanceof z.ZodError) {
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
        export async function removeTrackFromPlaylist(req: Request, res: Response) {
            try {
                const { playlistId, trackId } = req.params;
                const ownerId = req.user!.id;

                const playlist = await getPlaylistAndVerifyOwnership(playlistId, ownerId);
                 if (!playlist) {
                    return res.status(404).json({ message: 'Playlist not found.' });
                }

                const trackIds: types.Uuid[] = playlist.track_ids || [];
                const newTrackIds = trackIds.filter(id => id.toString() !== trackId);

                if (newTrackIds.length === trackIds.length) {
                    return res.status(404).json({ message: 'Track not found in this playlist.' });
                }

                const query = 'UPDATE playlists SET track_ids = ?, updated_at = ? WHERE id = ?';
                await dbClient.execute(query, [newTrackIds, new Date(), playlistId], { prepare: true });

                res.status(200).json({ message: 'Track removed from playlist.' });
            } catch (error: any) {
                if (error.message === 'FORBIDDEN') {
                    return res.status(403).json({ message: 'Forbidden: You do not own this playlist.' });
                }
                console.error('Remove track from playlist error:', error);
                res.status(500).json({ message: 'Internal server error.' });
            }
        }
        