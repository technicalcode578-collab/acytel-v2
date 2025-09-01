import { Component, For, Show } from "solid-js";
import { playlistStore } from "../../store/playlist.store";
import { playerActions } from "../../store/player.store";
import { Track } from "../../models/track";

export const PlaylistView: Component = () => {
  const handleRemove = (trackId: string) => {
    const playlistId = playlistStore.activePlaylist()?.id;
    if (!playlistId) return;

    playlistStore.removeTrackFromPlaylist(playlistId, trackId);
  };

  return (
    <div class="p-4 md:p-8">
      <Show when={playlistStore.activePlaylist()} fallback={<p>Select a playlist to view its contents.</p>}>
        {(playlist) => (
          <>
            <h1 class="text-4xl font-extrabold mb-2">{playlist().name}</h1>
            <p class="text-gray-400 mb-8">{playlist().description}</p>
            
            <ul class="space-y-3">
              <For each={playlist().tracks}>
                {(track: Track) => (
                   <li class="bg-gray-800 p-4 rounded-lg flex justify-between items-center border border-gray-700">
                    <div>
                      <p class="font-semibold text-white">{track.title}</p>
                      <p class="text-sm text-gray-400">{track.artist}</p>
                    </div>
                    <div class="flex items-center space-x-2">
                       <button onClick={() => handleRemove(track.id)} class="px-3 py-1 text-sm bg-red-600 hover:bg-red-500 rounded-full">
                        Remove
                      </button>
                      <button onClick={() => playerActions.playTrack(track)} class="px-3 py-1 text-sm bg-blue-600 hover:bg-blue-700 rounded-full">
                        Play
                      </button>
                    </div>
                  </li>
                )}
              </For>
            </ul>
          </>
        )}
      </Show>
    </div>
  );
};
