import api from './api';
import { Track } from '../models/track';

export async function getTracks(): Promise<Track[]> {
    const response = await api.get('/tracks');
    return response.data;
}

export async function uploadTrack(file: File): Promise<Track> {
    const formData = new FormData();
    formData.append('audioFile', file);
    const response = await api.post('/tracks/upload', formData);
    return response.data;
}

export async function getSecureTrackUrl(trackId: string): Promise<string> {
    const response = await api.get(`/tracks/${trackId}/secure-link`);
    return response.data.url;
}

export async function searchTracks(query: string): Promise<any[]> {
    const response = await api.get('/tracks/search', { params: { q: query } });
    return response.data.hits || [];
}

// This new function gets the secure URL and then fetches the audio as an ArrayBuffer
export async function fetchTrackAsArrayBuffer(trackId: string): Promise<ArrayBuffer> {
    const secureUrl = await getSecureTrackUrl(trackId);
    const response = await fetch(secureUrl);
    if (!response.ok) {
        throw new Error(`Failed to fetch audio file: ${response.statusText}`);
    }
    return response.arrayBuffer();
}
