// File: src/features/playlist/ui/AddToPlaylistModal.tsx
import { Component, createSignal, For, Show, Accessor } from 'solid-js';
import { playlistStore } from '../model/playlist.store';
import { Track } from '../../../shared/lib/track.model';

interface AddToPlaylistModalProps {
  isOpen: boolean;
  track: Track | null;
  onClose: () => void;
}

export const AddToPlaylistModal: Component<AddToPlaylistModalProps> = (props) => {
  const [selectedPlaylist, setSelectedPlaylist] = createSignal<string | null>(null);

  const handleAddTrack = async () => {
    if (props.track && selectedPlaylist()) {
      await playlistStore.addTrackToPlaylist(selectedPlaylist()!, props.track.id);
      props.onClose();
    }
  };

  return (
    <Show when={props.isOpen && props.track}>
      <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div class="bg-gray-800 p-6 rounded-lg shadow-lg w-full max-w-md">
          <h2 class="text-2xl font-bold mb-4">Add '{props.track?.title}' to a playlist</h2>
          <div class="space-y-4 max-h-60 overflow-y-auto">
            <For each={playlistStore.playlists()}>
              {(playlist) => (
                <div
                  class={`p-3 rounded-lg cursor-pointer border-2 ${selectedPlaylist() === playlist.id ? 'border-blue-500 bg-gray-700' : 'border-gray-600 hover:bg-gray-700'}`}
                  onClick={() => setSelectedPlaylist(playlist.id)}
                >
                  <p class="font-semibold">{playlist.name}</p>
                </div>
              )}
            </For>
          </div>
          <div class="mt-6 flex justify-end space-x-4">
            <button onClick={props.onClose} class="px-4 py-2 bg-gray-600 hover:bg-gray-700 rounded-lg">Cancel</button>
            <button onClick={handleAddTrack} disabled={!selectedPlaylist()} class="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg disabled:bg-gray-500 disabled:cursor-not-allowed">
              Add
            </button>
          </div>
        </div>
      </div>
    </Show>
  );
};