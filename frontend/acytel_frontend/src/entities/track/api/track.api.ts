import api from '../../../shared/api';
import { Track } from '../model/track.model';

export async function getPublicTracks(): Promise<Track[]> {
    const response = await api.get('/tracks/public');
    return response.data;
}

export async function getMyTracks(): Promise<Track[]> {
    const response = await api.get('/tracks/me');
    return response.data;
}

export async function uploadTrack(file: File, metadata: { title?: string, artist?: string, album?: string }): Promise<any> {
    const formData = new FormData();
    formData.append('audioFile', file);
    if (metadata.title) {
        formData.append('title', metadata.title);
    }
    if (metadata.artist) {
        formData.append('artist', metadata.artist);
    }
    if (metadata.album) {
        formData.append('album', metadata.album);
    }
    const response = await api.post('/tracks/upload', formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    });
    return response.data;
}

export async function getSecureTrackUrl(trackId: string): Promise<string> {
    const response = await api.get(`/tracks/${trackId}/secure-link`);
    return response.data.url;
}

export async function searchPublicTracks(query: string): Promise<Track[]> {
    const response = await api.get('/tracks/public/search', { params: { q: query } });
    return response.data.hits.map((hit: any) => hit.document);
}

export async function fetchTrackAsStream(trackId: string): Promise<ReadableStream<Uint8Array>> {
    const secureUrl = await getSecureTrackUrl(trackId);
    const response = await fetch(secureUrl);
    if (!response.ok || !response.body) {
        throw new Error(`Failed to fetch audio stream: ${response.statusText}`);
    }
    return response.body;
}
