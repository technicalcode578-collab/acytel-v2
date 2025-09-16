import { Request, Response } from 'express';
import * as mm from 'music-metadata';
import { v4 as uuidv4 } from 'uuid';
import dbClient from '../core/database';
import { typesenseClient } from '../core/search';
import { Track } from '../models/track';
import { indexTrack } from '../services/search.service';
import { 
  uploadAudioFile, 
  deleteAudioFile, 
  generateSignedUrl 
} from '../core/storage';

export async function uploadTrack(req: Request, res: Response) {
  try {
    const audioFile = req.file;

    if (!audioFile) {
      return res.status(400).json({ message: 'No audio file was uploaded.' });
    }
    if (!req.user?.id) {
      return res.status(401).json({ message: 'Authentication error.' });
    }

    const audioFileExtension = audioFile.originalname.split('.').pop() || 'mp3';
    const audioFileName = `${uuidv4()}.${audioFileExtension}`;

    // 1. Upload to Firebase Storage
    const storagePath = await uploadAudioFile(
      audioFile.buffer,
      audioFileName,
      audioFile.mimetype
    );

    // 2. Extract metadata
    const metadata = await mm.parseBuffer(audioFile.buffer, audioFile.mimetype);
    const common = metadata.common;
    const { title, artist, album } = req.body;
    const trackId = uuidv4();
    const now = new Date();
    
    const createdTrack: Track = {
        id: trackId,
        title: title || common.title || 'Untitled',
        artist: artist || common.artist || 'Unknown Artist',
        album: album || common.album || 'Unknown Album',
        durationInSeconds: Math.round(metadata.format.duration || 0),
        storagePath: storagePath, // The path in Firebase (e.g., "audio/some-file.mp3")
        artworkPath: '',
        uploadedBy: req.user.id,
        createdAt: now,
        updatedAt: now,
    };

    // 3. Insert metadata into database
    const insertQuery = `
        INSERT INTO tracks (id, title, artist, album, duration_in_seconds, storage_path, artwork_path, uploaded_by, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    await dbClient.execute(insertQuery, Object.values(createdTrack), { prepare: true });

    // 4. Index track in Typesense
    await indexTrack({
        id: createdTrack.id,
        title: createdTrack.title,
        artist: createdTrack.artist,
        album: createdTrack.album,
        uploaded_by: createdTrack.uploadedBy,
    });

    return res.status(201).json(createdTrack);
  } catch (error) {
    console.error('Track upload failed:', error);
    return res.status(500).json({ message: 'An internal server error occurred during file upload.' });
  }
}

export async function generateSecureStreamLink(req: Request, res: Response) {
  try {
    const { trackId } = req.params;
    if (!req.user?.id) {
      return res.status(401).json({ message: 'Authentication error.' });
    }
    
    // Fetch the track from the database to get its storage_path
    const query = 'SELECT storage_path FROM tracks WHERE id = ? LIMIT 1';
    const result = await dbClient.execute(query, [trackId], { prepare: true });
    const track = result.first();

    if (!track || !track.storage_path) {
        return res.status(404).json({ message: 'Track file not found.' });
    }

    // Generate a temporary, secure URL for the private file in Firebase
    const signedUrl = await generateSignedUrl(track.storage_path, 120); // 2 hours validity

    return res.status(200).json({ url: signedUrl });
  } catch (error) {
    console.error('Failed to generate secure link:', error);
    return res.status(500).json({ message: 'Could not generate secure link.' });
  }
}

// Other functions like listTracks, deleteTrack, etc. remain largely the same.
// This controller is now fully integrated with the new Firebase Storage logic.