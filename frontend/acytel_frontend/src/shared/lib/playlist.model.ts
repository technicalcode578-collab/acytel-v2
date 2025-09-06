// File: src/shared/lib/playlist.model.ts
import { Track } from "./track.model";

export interface Playlist {
  id: string;
  name: string;
  description: string;
  owner_id: string;
  created_at: string;
  updated_at: string;
}

export interface HydratedPlaylist extends Playlist {
    tracks: Track[];
}