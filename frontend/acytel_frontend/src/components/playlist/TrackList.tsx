        import { Component, For, Show, createSignal } from "solid-js";
        import { libraryStore } from "../../store/library.store";
        import { playerActions } from "../../store/player.store";
        import { Track } from "../../models/track";
        import { AddToPlaylistModal } from "../playlist/AddToPlaylistModal";

        export const TrackList: Component = () => {
          const [trackToAdd, setTrackToAdd] = createSignal<Track | null>(null);

          return (
            <div>
              <h2 class="text-2xl font-bold mb-4">Your Library</h2>
              <ul class="space-y-3">
                <For each={libraryStore.tracks}>
                  {(track) => (
                    <li class="bg-gray-800 p-4 rounded-lg flex justify-between items-center border border-gray-700">
                      <div>
                        <p class="font-semibold text-white">{track.title}</p>
                        <p class="text-sm text-gray-400">{track.artist}</p>
                      </div>
                      <div class="flex items-center space-x-2">
                        <button onClick={() => setTrackToAdd(track)} class="px-3 py-1 text-sm bg-gray-600 hover:bg-gray-500 rounded-full">
                          Add +
                        </button>
                        <button onClick={() => playerActions.playTrack(track)} class="px-3 py-1 text-sm bg-blue-600 hover:bg-blue-700 rounded-full">
                          Play
                        </button>
                      </div>
                    </li>
                  )}
                </For>
              </ul>
              {trackToAdd() && <AddToPlaylistModal track={trackToAdd()!} onClose={() => setTrackToAdd(null)} />}
            </div>
          );
        };
        