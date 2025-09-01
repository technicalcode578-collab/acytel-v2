        import api from './api';
        import { Playlist } from '../models/playlist';
        import { Track } from '../models/track';

        export async function getPlaylists(): Promise<Playlist[]> {
            const response = await api.get('/playlists');
            return response.data;
        }

        export async function createPlaylist(data: { name: string; description?: string }): Promise<Playlist> {
            const response = await api.post('/playlists', data);
            return response.data;
        }

        // This function now fetches the fully hydrated playlist
        export async function getPlaylistById(id: string): Promise<Playlist> {
            const response = await api.get(`/playlists/${id}`);
            return response.data;
        }
        
        export async function addTrackToPlaylist(playlistId: string, trackId: string): Promise<void> {
            await api.post(`/playlists/${playlistId}/tracks`, { trackId });
        }

        export async function removeTrackFromPlaylist(playlistId: string, trackId: string): Promise<void> {
            await api.delete(`/playlists/${playlistId}/tracks/${trackId}`);
        }
        