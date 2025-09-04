import { Track } from "./track";

export interface Playlist {
  id: string;
  name: string;
  description: string;
  owner_id: string;
  tracks: Track[]; // Changed from track_ids to a full Track array
  created_at: string;
  updated_at: string;
}

// NEW: Add this interface for playlists where tracks have been fully populated.
export interface HydratedPlaylist extends Omit<Playlist, 'track_ids'> {
    tracks: Track[];
}

