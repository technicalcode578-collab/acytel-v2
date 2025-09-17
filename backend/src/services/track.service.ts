
import { v4 as uuidv4 } from 'uuid';
import * as mm from 'music-metadata';
import dbClient from '../core/database';
import { typesenseClient } from '../core/search';
import { Track } from '../models/track';
import { indexTrack } from './search.service';
import { uploadAudioFile, deleteAudioFile } from '../core/storage';

// We will simulate a job queue for now. In a real-world scenario,
// this would be a robust message queue like RabbitMQ or Kafka.
const trackProcessingQueue = {
  add: async (job: any) => {
    // In this simulation, we process the job immediately.
    // In a real implementation, this would add the job to a queue.
    await processTrack(job);
  }
};

async function processTrack(job: { audioFile: Express.Multer.File, body: any, userId: string }) {
  const { audioFile, body, userId } = job;

  const audioFileExtension = audioFile.originalname.split('.').pop() || 'mp3';
  const audioFileName = `${uuidv4()}.${audioFileExtension}`;

  const storagePath = await uploadAudioFile(
    audioFile.buffer,
    audioFileName,
    audioFile.mimetype
  );

  const metadata = await mm.parseBuffer(audioFile.buffer, audioFile.mimetype);
  const common = metadata.common;
  const { title, artist, album } = body;
  const trackId = uuidv4();
  const now = new Date();

  const createdTrack: Track = {
    id: trackId,
    title: title || common.title || 'Untitled',
    artist: artist || common.artist || 'Unknown Artist',
    album: album || common.album || 'Unknown Album',
    durationInSeconds: Math.round(metadata.format.duration || 0),
    storagePath: storagePath,
    artworkPath: '',
    uploadedBy: userId,
    createdAt: now,
    updatedAt: now,
  };

  const insertQuery = `
      INSERT INTO tracks (id, title, artist, album, duration_in_seconds, storage_path, artwork_path, uploaded_by, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;
  await dbClient.execute(insertQuery, Object.values(createdTrack), { prepare: true });

  await indexTrack({
    id: createdTrack.id,
    title: createdTrack.title,
    artist: createdTrack.artist,
    album: createdTrack.album,
    uploaded_by: createdTrack.uploadedBy,
  });
}

export const TrackService = {
  enqueueTrackUpload: async (audioFile: Express.Multer.File, body: any, userId: string) => {
    await trackProcessingQueue.add({ audioFile, body, userId });
    return { message: 'Track upload has been queued for processing.' };
  },

  getPublicTracks: async () => {
    const query = 'SELECT id, title, artist, album, duration_in_seconds, storage_path FROM tracks';
    const result = await dbClient.execute(query, [], { prepare: true });
    return result.rows.map(row => ({
      id: row.id,
      title: row.title,
      artist: row.artist,
      album: row.album,
      durationInSeconds: row.duration_in_seconds,
      storagePath: row.storage_path
    }));
  },

  searchPublicTracks: async (query: string) => {
    const searchParameters = {
      'q': query,
      'query_by': 'title,artist,album',
    };
    return await typesenseClient.collections('tracks').documents().search(searchParameters);
  },

  deleteTrack: async (trackId: string, userId: string) => {
    const query = 'SELECT storage_path FROM tracks WHERE id = ? AND uploaded_by = ? LIMIT 1';
    const result = await dbClient.execute(query, [trackId, userId], { prepare: true });
    const track = result.first();

    if (!track) {
      throw new Error('Track not found or access denied.');
    }

    await deleteAudioFile(track.storage_path);
    
    const deleteQuery = 'DELETE FROM tracks WHERE id = ?';
    await dbClient.execute(deleteQuery, [trackId], { prepare: true });

    await typesenseClient.collections('tracks').documents(trackId).delete();
  }
};
