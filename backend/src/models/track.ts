/**
 * Represents the data structure for a Track, mirroring the 'tracks' table
 * in the ScyllaDB database. This ensures type safety for all music-related
 * logic in the backend application.
 */
export interface Track {
  id: string; // Stored as UUID
  title: string;
  artist: string;
  album: string;
  durationInSeconds: number;
  storagePath: string;
  artworkPath: string;
  uploadedBy: string; // Stored as UUID, links to a User
  createdAt: Date;
  updatedAt: Date;
}