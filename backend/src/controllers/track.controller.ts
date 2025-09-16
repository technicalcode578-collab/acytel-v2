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

    const storagePath = await uploadAudioFile(
      audioFile.buffer,
      audioFileName,
      audioFile.mimetype
    );

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
        storagePath: storagePath,
        artworkPath: '',
        uploadedBy: req.user.id,
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
    
    const query = 'SELECT storage_path FROM tracks WHERE id = ? LIMIT 1';
    const result = await dbClient.execute(query, [trackId], { prepare: true });
    const track = result.first();

    if (!track || !track.storage_path) {
        return res.status(404).json({ message: 'Track file not found.' });
    }

    const signedUrl = await generateSignedUrl(track.storage_path, 120);
    return res.status(200).json({ url: signedUrl });
  } catch (error) {
    console.error('Failed to generate secure link:', error);
    return res.status(500).json({ message: 'Could not generate secure link.' });
  }
}

// --- MISSING FUNCTIONS ADDED BACK ---

export async function listTracks(req: Request, res: Response) {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ message: 'Authentication error.' });
    }
    const query = 'SELECT id, title, artist, album, duration_in_seconds, storage_path FROM tracks WHERE uploaded_by = ? ALLOW FILTERING';
    const result = await dbClient.execute(query, [userId], { prepare: true });
    const tracks = result.rows.map(row => ({
      id: row.id,
      title: row.title,
      artist: row.artist,
      album: row.album,
      durationInSeconds: row.duration_in_seconds,
      storagePath: row.storage_path
    }));
    return res.status(200).json(tracks);
  } catch (error) {
    console.error('List tracks error:', error);
    return res.status(500).json({ message: 'An internal server error occurred.' });
  }
}

export async function streamTrack(req: Request, res: Response) {
    try {
        const { trackId } = req.params;
        const query = 'SELECT storage_path FROM tracks WHERE id = ? LIMIT 1';
        const result = await dbClient.execute(query, [trackId], { prepare: true });
        const track = result.first();

        if (!track) {
            return res.status(404).json({ message: 'Track not found.' });
        }
        
        const signedUrl = await generateSignedUrl(track.storage_path, 60);
        return res.redirect(signedUrl);
    } catch (error) {
        console.error('Track streaming failed:', error);
        return res.status(500).json({ message: 'An internal server error occurred during streaming.' });
    }
}

export async function searchTracks(req: Request, res: Response) {
    try {
        const query = req.query.q as string;
        const userId = req.user?.id;

        if (!userId) {
            return res.status(401).json({ message: 'Authentication error.' });
        }
        if (!query) {
            return res.status(400).json({ message: 'Query parameter "q" is required.' });
        }

        const searchParameters = {
            'q': query,
            'query_by': 'title,artist,album',
            'filter_by': `uploaded_by:=${userId}`
        };

        const searchResults = await typesenseClient.collections('tracks').documents().search(searchParameters);
        return res.status(200).json(searchResults);

    } catch (error) {
        console.error('Search failed:', error);
        return res.status(500).json({ message: 'An internal server error occurred during search.' });
    }
}

export async function deleteTrack(req: Request, res: Response) {
  try {
    const { trackId } = req.params;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ message: 'Authentication error.' });
    }

    const query = 'SELECT storage_path FROM tracks WHERE id = ? AND uploaded_by = ? LIMIT 1';
    const result = await dbClient.execute(query, [trackId, userId], { prepare: true });
    const track = result.first();

    if (!track) {
      return res.status(404).json({ message: 'Track not found or access denied.' });
    }

    try {
      await deleteAudioFile(track.storage_path);
    } catch (storageError) {
      console.warn('Failed to delete from storage, continuing with database deletion:', storageError);
    }

    const deleteQuery = 'DELETE FROM tracks WHERE id = ?';
    await dbClient.execute(deleteQuery, [trackId], { prepare: true });

    try {
      await typesenseClient.collections('tracks').documents(trackId).delete();
    } catch (searchError) {
      console.warn('Failed to delete from search index:', searchError);
    }

    return res.status(200).json({ message: 'Track deleted successfully.' });
  } catch (error) {
    console.error('Track deletion failed:', error);
    return res.status(500).json({ message: 'An internal server error occurred during deletion.' });
  }
}