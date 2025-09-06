// File: src/features/playlist/model/playlist.store.ts
import { createStore } from "solid-js/store";
import { Playlist, HydratedPlaylist } from "../../../shared/lib/playlist.model";
import * as playlistService from '../api/playlist.service';

interface PlaylistState {
  playlists: Playlist[];
  activePlaylist: HydratedPlaylist | null;
  loading: boolean;
}

const [store, setStore] = createStore<PlaylistState>({
  playlists: [],
  activePlaylist: null,
  loading: false,
});

export const playlistStore = {
  playlists: () => store.playlists,
  activePlaylist: () => store.activePlaylist,
  loading: () => store.loading,

  setPlaylists: (newPlaylists: Playlist[]) => {
    setStore('playlists', newPlaylists);
  },

  addPlaylist: (playlist: Playlist) => {
    setStore('playlists', p => [playlist, ...p]);
  },

  fetchAndSetActivePlaylist: async (playlistId: string) => {
    setStore('loading', true);
    try {
      const playlist = await playlistService.getPlaylistById(playlistId);
      setStore('activePlaylist', playlist);
    } catch (error) {
      console.error("Failed to fetch playlist", error);
      setStore('activePlaylist', null);
    } finally {
      setStore('loading', false);
    }
  },

  addTrackToPlaylist: async (playlistId: string, trackId: string) => {
    await playlistService.addTrackToPlaylist(playlistId, trackId);
    if (store.activePlaylist?.id === playlistId) {
      await playlistStore.fetchAndSetActivePlaylist(playlistId);
    }
  },

  removeTrackFromPlaylist: async (playlistId: string, trackId: string) => {
    const originalTracks = store.activePlaylist?.tracks;
    if (store.activePlaylist?.id === playlistId) {
      setStore('activePlaylist', 'tracks', t => t!.filter((track) => track.id !== trackId));
    }
    try {
      await playlistService.removeTrackFromPlaylist(playlistId, trackId);
    } catch (error) {
      console.error("Failed to remove track", error);
      if (store.activePlaylist?.id === playlistId) {
        setStore('activePlaylist', 'tracks', originalTracks ?? []);
      }
    }
  },

  clearActivePlaylist: () => {
    setStore('activePlaylist', null);
  }
};