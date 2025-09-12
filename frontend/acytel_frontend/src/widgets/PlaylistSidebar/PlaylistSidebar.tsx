import { Component, For, Show, onMount } from 'solid-js';
import { NowPlaying } from '../player/NowPlaying';
import { playlistStore } from '../../features/playlist/model/playlist.store';
import { playerState, playerActions } from '../../features/player/model/player.store';
import { Track } from '../../entities/track/model/track.model';
import { Playlist } from '../../shared/lib/playlist.model';
import { getPlaylists } from '../../features/playlist/api/playlist.service';

// --- Sub-Component for Playlist Grid View ---
const PlaylistCard: Component<{ playlist: Playlist }> = (props) => {
  return (
    <div 
      class="bg-surface p-3 rounded-lg shadow-md cursor-pointer hover:bg-accent transition-colors flex items-center gap-4"
      onClick={() => playlistStore.fetchAndSetActivePlaylist(props.playlist.id)}
    >
      <img 
        src={`https://placehold.co/64x64/1A1C25/FFFFFF?text=${props.playlist.name[0]}`}
        alt={props.playlist.name} 
        class="w-12 h-12 rounded-md"
      />
      <div>
        <h3 class="font-bold text-primary-text truncate">{props.playlist.name}</h3>
        <p class="text-sm text-muted truncate">{props.playlist.description || 'Playlist'}</p>
      </div>
    </div>
  );
};

// --- Sub-Component for Active Playlist (Track List) View ---
const TrackItem = (props: { track: Track }) => {
  const isActive = () => playerState.currentTrack()?.id === props.track.id;

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${String(remainingSeconds).padStart(2, '0')}`;
  };

  return (
    <div
      class="flex items-center p-2 rounded-lg cursor-pointer transition-colors hover:bg-surface/50"
      classList={{ 'active-track': isActive() }}
      onClick={() => playerActions.playTrack(props.track)}
    >
      <div class="flex-grow">
        <p class="font-bold text-primary-text text-sm tracking-tight truncate">{props.track.title}</p>
        <p class="text-xs text-muted truncate">{props.track.artist || 'Unknown Artist'}</p>
      </div>
      <div class="text-secondary-text text-sm ml-4">
        {formatDuration(props.track.durationInSeconds)}
      </div>
    </div>
  );
};

// --- Main Exported Component ---
export const PlaylistSidebar: Component = () => {
  const activePlaylist = () => playlistStore.activePlaylist();

  // Fetch all playlists when the sidebar first mounts
  onMount(async () => {
    try {
      const playlists = await getPlaylists();
      playlistStore.setPlaylists(playlists);
    } catch (error) {
      console.error("Failed to fetch playlists for sidebar:", error);
    }
  });

  return (
    <div class="p-4 h-full flex flex-col gap-4">
      <Show 
        when={activePlaylist()} 
        fallback={
          <div class="flex flex-col gap-4">
            <h2 class="text-xl font-bold text-primary-text">Your Playlists</h2>
            <div class="flex flex-col gap-2">
              <For each={playlistStore.playlists()}>
                {(playlist) => <PlaylistCard playlist={playlist} />}
              </For>
            </div>
          </div>
        }
      >
        <div class="flex flex-col gap-4">
          <div class="flex items-center justify-between">
            <h2 class="text-xl font-bold text-primary-text mb-0 truncate">
              {activePlaylist()?.name}
            </h2>
            <button 
              onClick={() => playlistStore.clearActivePlaylist()}
              class="text-sm text-muted hover:text-primary-text transition-colors"
            >
              &larr; Back
            </button>
          </div>
          <div class="flex flex-col gap-1">
            <For each={activePlaylist()!.tracks}>
              {(track) => <TrackItem track={track} />}
            </For>
          </div>
        </div>
      </Show>

      <div class="flex-grow"></div>
      <NowPlaying />
    </div>
  );
};