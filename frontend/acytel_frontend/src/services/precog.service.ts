import { hasTrack, storeTrack } from './cache.service';
import { getSecureTrackUrl } from './track.service'; // Import the secure URL generator
import { Track } from '../models/track';

const PRELOAD_COUNT = 2; // Preload next 2 tracks
let isPreloading = false; // Simple mutex to prevent multiple preloads at once

async function fetchAndCacheTrack(trackId: string): Promise<void> {
  // CRITICAL FIX: Use the secure, tokenized URL for the fetch request.
  const secureUrl = await getSecureTrackUrl(trackId);
  const response = await fetch(secureUrl);
  if (!response.ok) {
    throw new Error(`[Precog] Failed to fetch track ${trackId}: ${response.statusText}`);
  }
  const data = await response.arrayBuffer();
  await storeTrack(trackId, data);
  console.log(`[Precog] Successfully cached track ${trackId}.`);
}

export function preloadNextTracks(playlist: Track[], currentTrackId: string): void {
  const currentIndex = playlist.findIndex(t => t.id === currentTrackId);
  if (currentIndex === -1) return;

  for (let i = 1; i <= PRELOAD_COUNT; i++) {
    const nextIndex = currentIndex + i;
    if (nextIndex < playlist.length) {
      const nextTrack = playlist[nextIndex];
      
      // Fire-and-forget the preload process.
      (async () => {
        if (!(await hasTrack(nextTrack.id)) && !isPreloading) {
          isPreloading = true;
          console.log(`[Precog] Caching next track: ${nextTrack.title}`);
          try {
            await fetchAndCacheTrack(nextTrack.id);
          } catch (err) {
            console.error(`[Precog] Failed to cache track ${nextTrack.id}:`, err);
          } finally {
            isPreloading = false;
          }
        }
      })();
    }
  }
}