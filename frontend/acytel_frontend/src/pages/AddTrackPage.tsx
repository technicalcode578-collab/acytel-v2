import { createSignal, Component, onCleanup } from "solid-js";
import { uploadTrack } from "../entities/track/api/track.api";
import { libraryStore } from "../entities/track/model/track.store";

export const AddTrackPage: Component = () => {
  const [selectedFile, setSelectedFile] = createSignal<File | null>(null);
  const [title, setTitle] = createSignal("");
  const [artist, setArtist] = createSignal("");
  const [album, setAlbum] = createSignal("");
  const [loading, setLoading] = createSignal(false);
  const [error, setError] = createSignal("");
  const [success, setSuccess] = createSignal("");
  const [isDraggingAudio, setIsDraggingAudio] = createSignal(false);
  const [uploadProgress, setUploadProgress] = createSignal(0);

  const handleAudioFileChange = (files: FileList | null) => {
    if (files && files[0]) {
      setSelectedFile(files[0]);
    }
  };

  const handleAudioDrop = (e: DragEvent) => {
    e.preventDefault();
    setIsDraggingAudio(false);
    if (e.dataTransfer?.files) {
      handleAudioFileChange(e.dataTransfer.files);
    }
  };

  const handleAudioDragOver = (e: DragEvent) => {
    e.preventDefault();
    setIsDraggingAudio(true);
  };

  const handleAudioDragLeave = () => {
    setIsDraggingAudio(false);
  };

  const handleSubmit = async (e: Event) => {
    e.preventDefault();
    if (!selectedFile()) return;
    setLoading(true);
    setError("");
    setSuccess("");
    setUploadProgress(0);

    try {
      const metadata = {
        title: title(),
        artist: artist(),
        album: album(),
      };

      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => {
          if (prev >= 95) {
            clearInterval(progressInterval);
            return prev;
          }
          return prev + 5;
        });
      }, 200);

      const newTrack = await uploadTrack(selectedFile()!, metadata);
      clearInterval(progressInterval);
      setUploadProgress(100);

      libraryStore.addTrack(newTrack);

      setSuccess(`Successfully uploaded "${newTrack.title}"!`);
      setTimeout(() => {
        setSelectedFile(null);
        setTitle("");
        setArtist("");
        setAlbum("");
        setSuccess("");
        setUploadProgress(0);
        const audioFileInput = document.getElementById(
          "audio-file-upload"
        ) as HTMLInputElement;
        if (audioFileInput) audioFileInput.value = "";
      }, 2000);
    } catch (err) {
      setError("Upload failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  let audioDropZoneRef: HTMLDivElement | undefined;

  onCleanup(() => {
    // cleanup if needed
  });

  return (
    <div class="p-6 lg:p-10 bg-[#0a0a0a] min-h-screen text-gray-200 font-sans">
      <div class="max-w-3xl mx-auto">
        {/* Glass Panel */}
        <div class="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl shadow-lg p-8">
          {/* Header */}
          <div class="text-center mb-10">
            <h1 class="text-4xl font-bold tracking-tight text-white mb-2">
              Upload Your Track
            </h1>
            <p class="text-gray-400 text-lg">
              Share your sound with the world.
            </p>
          </div>

          <form onSubmit={handleSubmit} class="space-y-8">
            {/* Dropzone */}
            <div>
              <label class="block text-sm font-medium text-gray-400 mb-3">
                Audio File
              </label>
              <div
                ref={audioDropZoneRef}
                onDrop={handleAudioDrop}
                onDragOver={handleAudioDragOver}
                onDragLeave={handleAudioDragLeave}
                class={`relative border-2 border-dashed rounded-xl p-10 text-center transition-all duration-300 ${
                  isDraggingAudio()
                    ? "border-blue-500 bg-white/10"
                    : "border-gray-700 hover:border-gray-500 bg-white/5"
                }`}
              >
                <input
                  id="audio-file-upload"
                  type="file"
                  accept="audio/*"
                  class="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  onChange={(e) => handleAudioFileChange(e.currentTarget.files)}
                />
                <div class="flex flex-col items-center space-y-4 text-gray-400">
                  <svg
                    class="w-14 h-14"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          stroke-width="1.5"
                          d="M7 16a4 4 0 01-.88-7.903..."
                        />

                  </svg>
                  <p class="text-lg">Drag & drop your track</p>
                  <p class="text-sm">
                    or{" "}
                    <span class="text-blue-400 hover:text-blue-300">
                      browse
                    </span>
                  </p>
                </div>
                {selectedFile() && (
                  <div class="mt-6 text-sm text-gray-300">
                    Selected:{" "}
                    <span class="text-white">{selectedFile()!.name}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Inputs */}
            <div class="space-y-6">
              <input
                type="text"
                value={title()}
                onInput={(e) => setTitle(e.currentTarget.value)}
                placeholder="Track Title"
                required
                class="w-full bg-transparent border-b border-gray-700 text-white text-lg px-2 py-3 focus:border-blue-500 outline-none transition"
              />
              <input
                type="text"
                value={artist()}
                onInput={(e) => setArtist(e.currentTarget.value)}
                placeholder="Artist Name"
                required
                class="w-full bg-transparent border-b border-gray-700 text-white text-lg px-2 py-3 focus:border-blue-500 outline-none transition"
              />
              <input
                type="text"
                value={album()}
                onInput={(e) => setAlbum(e.currentTarget.value)}
                placeholder="Album (Optional)"
                class="w-full bg-transparent border-b border-gray-700 text-white text-lg px-2 py-3 focus:border-blue-500 outline-none transition"
              />
            </div>

            {/* Progress */}
            {loading() && (
              <div class="w-full bg-gray-800/50 rounded-full h-2 overflow-hidden">
                <div
                  class="bg-blue-600 h-2 transition-all duration-300"
                  style={{ width: `${uploadProgress()}%` }}
                ></div>
              </div>
            )}

            {/* Messages */}
            {success() && (
              <p class="text-center text-green-400 text-sm">{success()}</p>
            )}
            {error() && (
              <p class="text-center text-red-400 text-sm">{error()}</p>
            )}

            {/* Button */}
            <button
              type="submit"
              disabled={!selectedFile() || loading()}
              class="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold text-lg py-3 rounded-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
            >
              {loading() ? "Uploading..." : "Upload & Share"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddTrackPage;