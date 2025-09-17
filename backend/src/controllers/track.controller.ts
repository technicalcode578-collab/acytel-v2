import { Request, Response } from 'express';
import { TrackService } from '../services/track.service';
import dbClient from '../core/database';
import { generateSignedUrl } from '../core/storage';

export async function uploadTrack(req: Request, res: Response) {
  try {
    const audioFile = req.file;
    if (!audioFile) {
      return res.status(400).json({ message: 'No audio file was uploaded.' });
    }
    if (!req.user?.id) {
      return res.status(401).json({ message: 'Authentication error.' });
    }

    const result = await TrackService.enqueueTrackUpload(audioFile, req.body, req.user.id);
    return res.status(202).json(result);

  } catch (error) {
    console.error('Track upload failed:', error);
    return res.status(500).json({ message: 'An internal server error occurred during file upload.' });
  }
}

export async function getPublicTracks(req: Request, res: Response) {
  try {
    const tracks = await TrackService.getPublicTracks();
    return res.status(200).json(tracks);
  } catch (error) {
    console.error('Failed to get public tracks:', error);
    return res.status(500).json({ message: 'An internal server error occurred.' });
  }
}

export async function searchPublicTracks(req: Request, res: Response) {
  try {
    const query = req.query.q as string;
    if (!query) {
      return res.status(400).json({ message: 'Query parameter "q" is required.' });
    }
    const results = await TrackService.searchPublicTracks(query);
    return res.status(200).json(results);
  } catch (error) {
    console.error('Search failed:', error);
    return res.status(500).json({ message: 'An internal server error occurred during search.' });
  }
}

export async function listMyTracks(req: Request, res: Response) {
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

export async function deleteTrack(req: Request, res: Response) {
  try {
    const { trackId } = req.params;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ message: 'Authentication error.' });
    }

    await TrackService.deleteTrack(trackId, userId);
    return res.status(200).json({ message: 'Track deleted successfully.' });

  } catch (error) {
    console.error('Track deletion failed:', error);
    if (error instanceof Error) {
      return res.status(404).json({ message: error.message });
    }
    return res.status(500).json({ message: 'An internal server error occurred during deletion.' });
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
