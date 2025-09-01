export interface Playlist {
  id: string;
  name: string;
  description: string;
  owner_id: string;
  track_ids: string[];
  created_at: string;
  updated_at: string;
}