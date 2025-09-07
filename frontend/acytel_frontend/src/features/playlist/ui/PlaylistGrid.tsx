// File: src/features/playlist/ui/PlaylistGrid.tsx
import { Component, For } from 'solid-js';
import { playlistStore } from '../model/playlist.store';
import { Playlist } from '../../../shared/lib/playlist.model';

const PlaylistCard: Component<{ playlist: Playlist }> = (props) => {
  return (
    <div 
      class="bg-brand-gray p-4 rounded-lg shadow-lg cursor-pointer hover:bg-brand-light-gray transition-colors"
      onClick={() => playlistStore.fetchAndSetActivePlaylist(props.playlist.id)}
    >
      <img 
        src={`https://placehold.co/160x160/121212/FFFFFF?text=${props.playlist.name[0]}`}
        alt={props.playlist.name} 
        class="w-full h-40 object-cover rounded-md mb-4"
      />
      <h3 class="font-bold text-brand-white truncate">{props.playlist.name}</h3>
      <p class="text-sm text-gray-400 truncate">{props.playlist.description || 'Playlist'}</p>
    </div>
  );
};

export const PlaylistGrid: Component = () => {
  return (
    <div class="p-8">
      <h2 class="text-3xl font-bold mb-6 text-brand-white">Your Playlists</h2>
      <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
        <For each={playlistStore.playlists()}>
          {(playlist) => <PlaylistCard playlist={playlist} />}
        </For>
      </div>
    </div>
  );
};