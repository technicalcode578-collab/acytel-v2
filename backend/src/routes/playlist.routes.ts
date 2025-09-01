        import { Router } from 'express';
        import { authenticateToken } from '../middleware/auth.middleware';
        import {
          createPlaylist,
          getUserPlaylists,
          getPlaylistById,
          updatePlaylist,
          addTrackToPlaylist,
          removeTrackFromPlaylist,
        } from '../controllers/playlist.controller';

        const router = Router();

        // Apply authentication middleware to all playlist routes
        router.use(authenticateToken);

        router.route('/')
          .post(createPlaylist)
          .get(getUserPlaylists);

        router.route('/:id')
          .get(getPlaylistById)
          .put(updatePlaylist);

        // Routes for managing tracks within a playlist
        router.post('/:playlistId/tracks', addTrackToPlaylist);
        router.delete('/:playlistId/tracks/:trackId', removeTrackFromPlaylist);

        export default router;
        