import { Component, For, Show, createSignal } from "solid-js";
import searchState from "../../store/search.store";
import { playerActions } from "../../store/player.store";
import { Track } from "../../models/track";
import { AddToPlaylistModal } from "../playlist/AddToPlaylistModal";

export const SearchResults: Component = () => {
  const [isModalOpen, setIsModalOpen] = createSignal(false);
  const [selectedTrack, setSelectedTrack] = createSignal<Track | null>(null);

  const openAddToPlaylistModal = (track: Track) => {
    setSelectedTrack(track);
    setIsModalOpen(true);
  };

  const closeAddToPlaylistModal = () => {
    setIsModalOpen(false);
    setSelectedTrack(null);
  };

  return (
    <div>
      <h2 class="text-2xl font-bold mb-4">Search Results</h2>
      <Show 
        when={!searchState.isSearching && searchState.results.length > 0}
        fallback={
            <p class="text-gray-400">
                {searchState.isSearching ? "Searching..." : "No results found for your query."}
            </p>
        }
      >
        <ul class="space-y-3">
          <For each={searchState.results}>
            {(track: Track) => (
              <li class="bg-gray-800 p-4 rounded-lg flex justify-between items-center border border-gray-700">
                <div>
                  <p class="font-semibold text-white">{track.title}</p>
                  <p class="text-sm text-gray-400">{track.artist}</p>
                </div>
                <div class="flex items-center space-x-4">
                    <button 
                      onClick={() => playerActions.playTrack(track)} 
                      class="px-3 py-1 text-sm bg-blue-600 hover:bg-blue-700 rounded-full"
                    >
                      Play
                    </button>
                    <button onClick={() => openAddToPlaylistModal(track)} class="px-3 py-1 text-sm bg-green-600 hover:bg-green-700 rounded-full">
                        Add to Playlist
                    </button>
                </div>
              </li>
            )}
          </For>
        </ul>
      </Show>
      <AddToPlaylistModal track={selectedTrack()} onClose={closeAddToPlaylistModal} />
    </div>
  );
};