import { Component, For, Show, onMount, createSignal } from 'solid-js';
import { NowPlaying } from '../player/NowPlaying';
import { playlistStore } from '../../features/playlist/model/playlist.store';
import { playerState, playerActions } from '../../features/player/model/player.store';
import { libraryStore } from '../../entities/track/model/track.store';
import { Track } from '../../entities/track/model/track.model';
import { Playlist } from '../../shared/lib/playlist.model';
import { getPlaylists } from '../../features/playlist/api/playlist.service';
import { getPublicTracks } from '../../entities/track/api/track.api';
import { initializeWasm } from '../../shared/lib/wasm-loader';

// --- Enhanced Track Item Component ---
const TrackItem = (props: { track: Track; showFromPlaylist?: boolean }) => {
  const isActive = () => playerState.currentTrack()?.id === props.track.id;
  const isPlaying = () => isActive() && playerState.isPlaying();

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${String(remainingSeconds).padStart(2, '0')}`;
  };

  return (
    <div
      class={`flex items-center p-2 rounded-lg cursor-pointer transition-all hover:bg-surface/50 ${
        isActive() ? 'bg-accent/20 border-l-2 border-accent' : ''
      }`}
      onClick={() => playerActions.playTrack(props.track)}
    >
      {/* Play/Playing Indicator */}
      <div class="w-8 h-8 rounded-md bg-gradient-to-br from-accent/20 to-blue-400/20 flex items-center justify-center mr-3 flex-shrink-0">
        <Show 
          when={isPlaying()} 
          fallback={
            <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" class="text-accent">
              <path d="M8 5V19L19 12L8 5Z"/>
            </svg>
          }
        >
          <div class="flex space-x-0.5">
            <div class="w-0.5 h-3 bg-accent animate-pulse"></div>
            <div class="w-0.5 h-4 bg-accent animate-pulse" style="animation-delay: 0.1s"></div>
            <div class="w-0.5 h-3 bg-accent animate-pulse" style="animation-delay: 0.2s"></div>
          </div>
        </Show>
      </div>

      {/* Track Info */}
      <div class="flex-grow min-w-0">
        <p class={`font-semibold text-sm tracking-tight truncate ${
          isActive() ? 'text-accent' : 'text-primary-text'
        }`}>
          {props.track.title}
        </p>
        <p class="text-xs text-muted truncate">
          {props.track.artist || 'Unknown Artist'}
        </p>
      </div>

      {/* Duration */}
      <div class="text-secondary-text text-xs ml-2 flex-shrink-0">
        {formatDuration(props.track.durationInSeconds)}
      </div>
    </div>
  );
};

// --- Enhanced Playlist Card Component ---
const PlaylistCard: Component<{ playlist: Playlist }> = (props) => {
  return (
    <div 
      class="bg-surface/40 p-3 rounded-lg shadow-md cursor-pointer hover:bg-surface/60 transition-all hover:scale-[1.02] flex items-center gap-3"
      onClick={() => playlistStore.fetchAndSetActivePlaylist(props.playlist.id)}
    >
      {/* Playlist Icon */}
      <div class="w-10 h-10 rounded-lg bg-gradient-to-br from-accent/30 to-blue-400/30 flex items-center justify-center flex-shrink-0">
        <span class="text-sm font-bold text-accent">
          {props.playlist.name[0]?.toUpperCase()}
        </span>
      </div>
      
      {/* Playlist Info */}
      <div class="flex-grow min-w-0">
        <h3 class="font-bold text-primary-text truncate text-sm">{props.playlist.name}</h3>
        <p class="text-xs text-muted truncate">
          {props.playlist.description || 'Playlist'}
        </p>
      </div>

      {/* Arrow Icon */}
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" class="text-secondary-text flex-shrink-0">
        <path d="M9 18L15 12L9 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
    </div>
  );
};

// --- Collapsible Section Component ---
const CollapsibleSection: Component<{
  title: string;
  children: any;
  defaultOpen?: boolean;
  count?: number;
}> = (props) => {
  const [isOpen, setIsOpen] = createSignal(props.defaultOpen ?? true);

  return (
    <div class="mb-4">
      <button
        class="w-full flex items-center justify-between p-2 hover:bg-surface/30 rounded-lg transition-colors mb-2"
        onClick={() => setIsOpen(!isOpen())}
      >
        <div class="flex items-center gap-2">
          <h3 class="font-bold text-primary-text text-sm">{props.title}</h3>
          {props.count !== undefined && (
            <span class="text-xs bg-surface/50 px-2 py-0.5 rounded-full text-secondary-text">
              {props.count}
            </span>
          )}
        </div>
        <svg 
          width="16" 
          height="16" 
          viewBox="0 0 24 24" 
          fill="none" 
          class={`text-secondary-text transition-transform ${isOpen() ? 'rotate-90' : ''}`}
        >
          <path d="M9 18L15 12L9 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </button>
      
      <Show when={isOpen()}>
        <div class="space-y-1">
          {props.children}
        </div>
      </Show>
    </div>
  );
};

// --- Main Enhanced PlaylistSidebar Component ---
export const PlaylistSidebar: Component = () => {
  const [tracksLoaded, setTracksLoaded] = createSignal(false);
  const activePlaylist = () => playlistStore.activePlaylist();

  // Initialize both tracks and playlists
  onMount(async () => {
    try {
      console.log('🚀 Initializing Universe No. 1 Sidebar...');
      
      // Initialize audio engine
      await initializeWasm();
      console.log("🎵 Audio service initialized");
      
      // Load both tracks and playlists
      const [tracks, playlists] = await Promise.all([
        getPublicTracks(),
        getPlaylists()
      ]);
      
      libraryStore.setTracks(tracks);
      playlistStore.setPlaylists(playlists);
      setTracksLoaded(true);
      
      console.log("📚 Sidebar loaded with", tracks.length, "tracks and", playlists.length, "playlists");
    } catch (error) {
      console.error("❌ Failed to initialize sidebar:", error);
    }
  });

  return (
    <div class="p-4 h-full flex flex-col gap-4">
      <Show 
        when={activePlaylist()} 
        fallback={
          <div class="flex flex-col gap-4 flex-grow overflow-hidden">
            
            {/* Your Music Library Section */}
            <Show when={tracksLoaded()}>
              <CollapsibleSection 
                title="Public Tracks" 
                count={libraryStore.tracks.length}
                defaultOpen={true}
              >
                <div class="max-h-64 overflow-y-auto space-y-1">
                  <Show 
                    when={libraryStore.tracks.length > 0}
                    fallback={
                      <div class="text-center py-8">
                        <svg class="mx-auto h-12 w-12 text-muted mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19V6l12-3v13M9 19c0 1.105-2.343 2 5 2s5-.895 5-2M9 19c0-1.105 2.343-2 5-2s5 .895 5 2M15 10l0-4"/>
                        </svg>
                        <p class="text-secondary-text text-sm">No tracks uploaded yet</p>
                      </div>
                    }
                  >
                    <For each={libraryStore.tracks}>
                      {(track) => <TrackItem track={track} />}
                    </For>
                  </Show>
                </div>
              </CollapsibleSection>
            </Show>

            {/* Your Playlists Section */}
            <CollapsibleSection 
              title="Your Playlists" 
              count={playlistStore.playlists().length}
              defaultOpen={true}
            >
              <div class="space-y-2">
                <Show 
                  when={playlistStore.playlists().length > 0}
                  fallback={
                    <div class="text-center py-6">
                      <svg class="mx-auto h-10 w-10 text-muted mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"/>
                      </svg>
                      <p class="text-secondary-text text-sm">No playlists created yet</p>
                    </div>
                  }
                >
                  <For each={playlistStore.playlists()}>
                    {(playlist) => <PlaylistCard playlist={playlist} />}
                  </For>
                </Show>
              </div>
            </CollapsibleSection>
          </div>
        }
      >
        {/* Active Playlist View */}
        <div class="flex flex-col gap-4 flex-grow overflow-hidden">
          <div class="flex items-center justify-between">
            <h2 class="text-lg font-bold text-primary-text truncate">
              {activePlaylist()?.name}
            </h2>
            <button 
              onClick={() => playlistStore.clearActivePlaylist()}
              class="text-sm text-muted hover:text-primary-text transition-colors flex items-center gap-1"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                <path d="M15 18L9 12L15 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
              Back
            </button>
          </div>
          
          <div class="flex-grow overflow-y-auto space-y-1">
            <Show 
              when={activePlaylist()!.tracks.length > 0}
              fallback={
                <div class="text-center py-12">
                  <p class="text-secondary-text">No tracks in this playlist</p>
                </div>
              }
            >
              <For each={activePlaylist()!.tracks}>
                {(track) => <TrackItem track={track} showFromPlaylist={true} />}
              </For>
            </Show>
          </div>
        </div>
      </Show>

      {/* Now Playing - Always at bottom */}
      <div class="flex-shrink-0 mt-auto border-t border-surface/50 pt-4">
        <NowPlaying />
      </div>
    </div>
  );
};