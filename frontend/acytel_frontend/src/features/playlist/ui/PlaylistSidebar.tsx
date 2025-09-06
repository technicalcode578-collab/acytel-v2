// File: src/features/playlist/ui/PlaylistSidebar.tsx
import { Component, For, createSignal, Show } from "solid-js";
import { playlistStore } from "../model/playlist.store";
import { CreatePlaylistModal } from "./CreatePlaylistModal";

export const PlaylistSidebar: Component = () => {
  const [isModalOpen, setIsModalOpen] = createSignal(false);

  return (
    <aside class="w-64 bg-gray-800 p-4 space-y-4 flex-shrink-0 border-r border-gray-700">
      <div class="flex justify-between items-center">
        <h2 class="text-xl font-bold">Playlists</h2>
        <button 
          onClick={() => setIsModalOpen(true)}
          class="px-2 py-1 text-xs bg-blue-600 hover:bg-blue-700 rounded"
        >
          New
        </button>
      </div>
      <nav class="space-y-2">
        <For each={playlistStore.playlists()}>
          {(playlist) => (
            <button 
              onClick={() => playlistStore.fetchAndSetActivePlaylist(playlist.id)}
              class="w-full text-left p-2 rounded-md hover:bg-gray-700 text-gray-300 focus:outline-none focus:bg-gray-700"
              classList={{'bg-gray-700': playlistStore.activePlaylist()?.id === playlist.id}}
            >
              {playlist.name}
            </button>
          )}
        </For>
      </nav>
      <Show when={isModalOpen()}>
        <CreatePlaylistModal onClose={() => setIsModalOpen(false)} />
      </Show>
    </aside>
  );
};