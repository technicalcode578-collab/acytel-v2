        import { createStore, produce } from "solid-js/store";
        import { Playlist, HydratedPlaylist } from "../models/playlist";
        import { Track } from "../models/track";
        import * as playlistService from '../services/playlist.service';

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
            try {
              await playlistService.addTrackToPlaylist(playlistId, trackId);
              // Optionally, you can refetch the active playlist to ensure data is in sync
              if (store.activePlaylist?.id === playlistId) {
                await playlistStore.fetchAndSetActivePlaylist(playlistId);
              }
            } catch (error) {
              console.error("Failed to add track to playlist", error);
              // Handle error, e.g., show a notification
            }
          },

          removeTrackFromPlaylist: async (playlistId: string, trackId: string) => {
            // Optimistic update
            const originalTracks = store.activePlaylist?.tracks;
            if (store.activePlaylist && store.activePlaylist.id === playlistId) {
                setStore(
                    'activePlaylist',
                    'tracks',
                    (t) => t!.filter((track) => track.id !== trackId)
                );
            }

            try {
              await playlistService.removeTrackFromPlaylist(playlistId, trackId);
            } catch (error) {
              console.error("Failed to remove track from playlist", error);
              // Revert on error
              if (store.activePlaylist && store.activePlaylist.id === playlistId) {
                setStore('activePlaylist', 'tracks', originalTracks);
              }
              // Handle error, e.g., show a notification
            }
          },

          clearActivePlaylist: () => {
            setStore('activePlaylist', null);
          }
        };
        