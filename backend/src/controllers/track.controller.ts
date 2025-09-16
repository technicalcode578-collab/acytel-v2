import { Request, Response } from 'express';
import { PutObjectCommand, GetObjectCommand, HeadObjectCommand } from '@aws-sdk/client-s3';
import * as mm from 'music-metadata';
import { v4 as uuidv4 } from 'uuid';
import jwt from 'jsonwebtoken';
import { Readable } from 'stream';
import s3Client from '../core/storage';
import dbClient from '../core/database';
import { Track } from '../models/track';
import { indexTrack } from '../services/search.service';
import { typesenseClient } from '../core/search';

const BUCKET_NAME = 'acytel-music';

export async function uploadTrack(req: Request, res: Response) {
  try {
    const audioFile = req.file;

    if (!audioFile) {
      return res.status(400).json({ message: 'No audio file was uploaded.' });
    }
    if (!req.user?.id) {
      return res.status(401).json({ message: 'Authentication error.' });
    }

    // Upload audio file
    const audioFileExtension = audioFile.originalname.split('.').pop() || 'mp3';
    const audioStorageKey = `${uuidv4()}.${audioFileExtension}`;
    const audioUploadParams = {
      Bucket: BUCKET_NAME,
      Key: audioStorageKey,
      Body: audioFile.buffer,
      ContentType: audioFile.mimetype,
    };
    await s3Client.send(new PutObjectCommand(audioUploadParams));

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
        storagePath: audioStorageKey,
        artworkPath: '', // Reverted to empty string
        uploadedBy: req.user.id,
        createdAt: now,
        updatedAt: now,
    };
    const insertQuery = `
        INSERT INTO tracks (id, title, artist, album, duration_in_seconds, storage_path, artwork_path, uploaded_by, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    const params = [ createdTrack.id, createdTrack.title, createdTrack.artist, createdTrack.album, createdTrack.durationInSeconds, createdTrack.storagePath, createdTrack.artworkPath, createdTrack.uploadedBy, createdTrack.createdAt, createdTrack.updatedAt ];
    await dbClient.execute(insertQuery, params, { prepare: true });

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

        const key = track.storage_path;
        const headObjectParams = { Bucket: BUCKET_NAME, Key: key };
        const headResponse = await s3Client.send(new HeadObjectCommand(headObjectParams));
        const fileSize = headResponse.ContentLength;
        const mimeType = headResponse.ContentType || 'audio/mpeg';

        res.setHeader('Accept-Ranges', 'bytes');
        res.setHeader('Content-Type', mimeType);

        const range = req.headers.range;

        if (range && fileSize) {
            const parts = range.replace(/bytes=/, "").split("-");
            const start = parseInt(parts[0], 10);
            const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
            
            const chunkSize = (end - start) + 1;

            res.writeHead(206, {
                'Content-Range': `bytes ${start}-${end}/${fileSize}`,
                'Content-Length': chunkSize,
            });

            const getObjectParams = { Bucket: BUCKET_NAME, Key: key, Range: `bytes=${start}-${end}` };
            const s3Object = await s3Client.send(new GetObjectCommand(getObjectParams));
            
            if (s3Object.Body && s3Object.Body instanceof Readable) {
                s3Object.Body.pipe(res);
            } else {
                throw new Error('Streamable body not found in S3 object.');
            }
        } else if (fileSize) {
            res.setHeader('Content-Length', fileSize.toString());
            res.writeHead(200);

            const getObjectParams = { Bucket: BUCKET_NAME, Key: key };
            const s3Object = await s3Client.send(new GetObjectCommand(getObjectParams));
            
            if (s3Object.Body && s3Object.Body instanceof Readable) {
                s3Object.Body.pipe(res);
            } else {
                throw new Error('File size could not be determined.');
            }
        } else {
            throw new Error('File size could not be determined.');
        }
    } catch (error) {
        console.error('Track streaming failed:', error);
        return res.status(500).json({ message: 'An internal server error occurred during streaming.' });
    }
}

export async function generateSecureStreamLink(req: Request, res: Response) {
  try {
    const { trackId } = req.params;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ message: 'Authentication error.' });
    }
    
    // Fetch the track from the database to get its storage_path
    const query = 'SELECT storage_path FROM tracks WHERE id = ? LIMIT 1';
    const result = await dbClient.execute(query, [trackId], { prepare: true });
    const track = result.first();

    if (!track || !track.storage_path) {
        return res.status(404).json({ message: 'Track file not found.' });
    }

    const secret = process.env.STREAM_TOKEN_SECRET;
    if (!secret) {
      throw new Error('Stream token secret is not configured.');
    }

    const payload = {
        storage_path: track.storage_path,
    };
    const tempToken = jwt.sign(
      payload,
      secret,
      { expiresIn: '15s' }
    );

    // --- THIS IS THE CRITICAL FIX ---
    // IMPORTANT: Replace the placeholder with the public URL for port 8000 from your Codespace
    const RUST_SERVICE_BASE_URL = process.env.STREAMER_BASE_URL;

    const secureUrl = `${RUST_SERVICE_BASE_URL}/stream?token=${tempToken}`;

    return res.status(200).json({ url: secureUrl });

  } catch (error) {
    console.error('Failed to generate secure link:', error);
    return res.status(500).json({ message: 'Could not generate secure link.' });
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
