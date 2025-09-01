            import { Component, For, createSignal } from "solid-js";
            import { playlistStore } from "../../store/playlist.store";
            import { CreatePlaylistModal } from "./CreatePlaylistModal";

            export const PlaylistSidebar: Component = () => {
              const [isModalOpen, setIsModalOpen] = createSignal(false);

              const handlePlaylistSelect = (playlistId: string) => {
                playlistStore.fetchAndSetActivePlaylist(playlistId);
              };

              return (
                <aside class="w-64 bg-gray-800 p-4 space-y-4 flex-shrink-0">
                  <h2 class="text-xl font-bold">Playlists</h2>
                  <button onClick={() => setIsModalOpen(true)} /* ... */ >
                    New Playlist
                  </button>
                  <nav class="space-y-2">
                    <For each={playlistStore.playlists()}>
                      {(playlist) => (
                        <button onClick={() => handlePlaylistSelect(playlist.id)} class="w-full text-left p-2 rounded-md hover:bg-gray-700 text-gray-300">
                          {playlist.name}
                        </button>
                      )}
                    </For>
                  </nav>
                  {isModalOpen() && <CreatePlaylistModal onClose={() => setIsModalOpen(false)} />}
                </aside>
              );
            };
            