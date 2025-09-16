import dotenv from 'dotenv';
dotenv.config({ path: './backend/.env' });

import dbClient from '../src/core/database';
import { indexTrack, initializeTrackCollection } from '../src/services/search.service';
import { Track } from '../src/models/track';

const backfill = async () => {
  console.log('Starting backfill...');
  try {
    await initializeTrackCollection();
    const result = await dbClient.execute('SELECT * FROM tracks');
    const tracks: Track[] = result.rows.map((row: any) => ({
      id: row.id.toString(),
      title: row.title,
      artist: row.artist,
      album: row.album,
      durationInSeconds: row.duration_in_seconds,
      storagePath: row.storage_path,
      artworkPath: row.artwork_path,
      uploadedBy: row.uploaded_by.toString(),
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    }));

    for (const track of tracks) {
      // --- START: Replace the old indexTrack call with this block ---

// Create a correctly shaped object for the indexer
const trackToIndex = {
  id: track.id,
  title: track.title,
  artist: track.artist,
  album: track.album,
  uploaded_by: track.uploadedBy // Map camelCase to snake_case
};

// Index the correctly shaped object
await indexTrack(trackToIndex);

// --- END: Replacement block ---
      console.log(`Indexed track ${track.id} - ${track.title}`);
    }

    console.log('Backfill complete.');
  } catch (error) {
    console.error('Backfill failed:', error);
  } finally {
    await dbClient.shutdown();
  }
};

backfill();
