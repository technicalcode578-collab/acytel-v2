// File: src/entities/track/api/track.api.ts
import api from '../../../shared/api';
import { Track } from '../model/track.model';

export async function getTracks(): Promise<Track[]> {
    const response = await api.get('/tracks');
    return response.data;
}

export async function uploadTrack(file: File): Promise<Track> {
    const formData = new FormData();
    formData.append('audioFile', file);
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

export async function searchTracks(query: string): Promise<Track[]> {
    const response = await api.get('/api/tracks/search', { params: { q: query } });
    return response.data.hits || [];
}

export async function fetchTrackAsStream(trackId: string): Promise<ReadableStream<Uint8Array>> {
    const secureUrl = await getSecureTrackUrl(trackId);
    const response = await fetch(secureUrl);
    if (!response.ok || !response.body) {
        throw new Error(`Failed to fetch audio stream: ${response.statusText}`);
    }
    return response.body;
}