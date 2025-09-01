        import { Component, createSignal } from "solid-js";
        import { createPlaylist } from "../../services/playlist.service";
        import { playlistStore } from "../../store/playlist.store";

        interface CreatePlaylistModalProps {
          onClose: () => void;
        }

        export const CreatePlaylistModal: Component<CreatePlaylistModalProps> = (props) => {
          const [name, setName] = createSignal("");
          const [description, setDescription] = createSignal("");
          const [error, setError] = createSignal("");
          const [loading, setLoading] = createSignal(false);

          const handleSubmit = async (e: Event) => {
            e.preventDefault();
            if (!name()) {
              setError("Playlist name is required.");
              return;
            }
            setLoading(true);
            setError("");
            try {
              const newPlaylist = await createPlaylist({ name: name(), description: description() });
              playlistStore.addPlaylist(newPlaylist);
              props.onClose();
            } catch (err) {
              setError("Failed to create playlist.");
            } finally {
              setLoading(false);
            }
          };

          return (
            <div class="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
              <div class="bg-gray-800 p-8 rounded-lg shadow-xl w-full max-w-md">
                <h2 class="text-2xl font-bold mb-6 text-white">Create New Playlist</h2>
                <form onSubmit={handleSubmit}>
                  <div class="mb-4">
                    <label for="name" class="block text-sm font-medium text-gray-300">Name</label>
                    <input
                      type="text"
                      id="name"
                      value={name()}
                      onInput={(e) => setName(e.currentTarget.value)}
                      class="mt-1 block w-full bg-gray-700 border border-gray-600 rounded-md py-2 px-3 text-white focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                  </div>
                  <div class="mb-6">
                    <label for="description" class="block text-sm font-medium text-gray-300">Description</label>
                    <textarea
                      id="description"
                      value={description()}
                      onInput={(e) => setDescription(e.currentTarget.value)}
                      rows="3"
                      class="mt-1 block w-full bg-gray-700 border border-gray-600 rounded-md py-2 px-3 text-white focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  {error() && <p class="text-red-400 text-sm mb-4">{error()}</p>}
                  <div class="flex justify-end space-x-4">
                    <button type="button" onClick={props.onClose} class="px-4 py-2 rounded-md text-sm font-medium text-gray-300 hover:bg-gray-700">
                      Cancel
                    </button>
                    <button type="submit" disabled={loading()} class="px-4 py-2 rounded-md text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:bg-gray-500">
                      {loading() ? "Creating..." : "Create Playlist"}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          );
        };
        