import { Track } from '../../entities/track/model/track.model';

export interface Playlist {
  id: string;
  name: string;
  description?: string | null;
  owner_id: string;
  created_at: Date;
  updated_at: Date;
}

export interface HydratedPlaylist extends Playlist {
  tracks: Track[];
}
