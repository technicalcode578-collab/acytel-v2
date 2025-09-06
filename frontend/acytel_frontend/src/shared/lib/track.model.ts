// File: src/shared/lib/track.model.ts
export interface Track {
  id: string;
  title: string;
  artist: string;
  album: string;
  durationInSeconds: number;
  storagePath: string;
  artworkPath: string;
  uploadedBy: string;
  createdAt: Date;
  updatedAt: Date;
}