import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getStorage } from 'firebase-admin/storage';

// Initialize Firebase Admin (only if not already initialized)
if (!getApps().length) {
  initializeApp({
    credential: cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      // This correctly formats the private key from the environment variable
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    }),
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  });
}

const bucket = getStorage().bucket();

/**
 * Uploads an audio file buffer to Firebase Storage.
 * Files are private by default.
 */
export const uploadAudioFile = async (
  fileBuffer: Buffer, 
  fileName: string, 
  mimetype: string
): Promise<string> => {
  const filePath = `audio/${fileName}`;
  const file = bucket.file(filePath);
  
  await file.save(fileBuffer, {
    metadata: {
      contentType: mimetype,
    },
  });

  // Returns the full path within the bucket (e.g., "audio/some-file.mp3")
  return filePath; 
};

/**
 * Deletes a file from Firebase Storage using its path.
 */
export const deleteAudioFile = async (storagePath: string): Promise<void> => {
  const file = bucket.file(storagePath);
  await file.delete();
};

/**
 * Generates a temporary, secure URL to stream a private file.
 */
export const generateSignedUrl = async (
  storagePath: string, 
  expiresInMinutes: number = 60
): Promise<string> => {
  const file = bucket.file(storagePath);
  const [signedUrl] = await file.getSignedUrl({
    action: 'read',
    expires: Date.now() + (expiresInMinutes * 60 * 1000),
  });
  return signedUrl;
};