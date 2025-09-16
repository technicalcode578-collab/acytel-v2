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
    const file = selectedFile();
    if (!file) return;
    
    setLoading(true);
    setError("");
    setSuccess("");
    setUploadProgress(0);

    // Fake progress for better UX, stops at 95% before actual upload completes
    const progressInterval = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev >= 95) {
          clearInterval(progressInterval);
          return prev;
        }
        return prev + 5;
      });
    }, 200);

    try {
      const metadata = {
        title: title(),
        artist: artist(),
        album: album(),
      };
      
      const newTrack = await uploadTrack(file, metadata);
      
      clearInterval(progressInterval);
      setUploadProgress(100);
      libraryStore.addTrack(newTrack);
      setSuccess(`Successfully uploaded "${newTrack.title}"!`);

      // Reset form after a short delay
      setTimeout(() => {
        setSelectedFile(null);
        setTitle("");
        setArtist("");
        setAlbum("");
        setSuccess("");
        setUploadProgress(0);
        const audioFileInput = document.getElementById("audio-file-upload") as HTMLInputElement;
        if (audioFileInput) audioFileInput.value = "";
      }, 2000);
    } catch (err) {
      clearInterval(progressInterval);
      setError("Upload failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div class="bg-black min-h-screen text-neutral-200 font-sans p-4 sm:p-6 lg:p-8">
      <div class="max-w-2xl mx-auto">
        {/* Refined Glass Panel */}
        <div class="relative backdrop-blur-2xl bg-gray-900/50 border border-neutral-800 rounded-2xl shadow-2xl p-6 sm:p-8">
          {/* Header */}
          <div class="text-center mb-8">
            <h1 class="text-3xl sm:text-4xl font-bold tracking-tight text-white">
              Upload Track
            </h1>
            <p class="text-neutral-400 mt-2">
              Share your sound with the world.
            </p>
          </div>

          <form onSubmit={handleSubmit} class="space-y-6">
            {/* Dropzone */}
            <div>
              <label class="block text-sm font-medium text-neutral-400 mb-2">
                Audio File
              </label>
              <div
                onDrop={handleAudioDrop}
                onDragOver={handleAudioDragOver}
                onDragLeave={handleAudioDragLeave}
                class={`relative border-2 border-dashed rounded-xl p-8 text-center transition-all duration-300 ease-in-out cursor-pointer
                  ${ isDraggingAudio()
                      ? "border-blue-500 bg-gray-800/60 scale-105"
                      : "border-neutral-700 hover:border-neutral-600 bg-black/20"
                  }`}
              >
                <input
                  id="audio-file-upload"
                  type="file"
                  accept="audio/*"
                  class="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  onChange={(e) => handleAudioFileChange(e.currentTarget.files)}
                />
                <div class="flex flex-col items-center space-y-3 text-neutral-400">
                  {/* New, more aesthetic upload icon */}
                  <svg class="w-12 h-12 text-neutral-600" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M12 16.5V9.75m0 0l3 3m-3-3l-3 3M6.75 19.5a4.5 4.5 0 01-1.41-8.775 5.25 5.25 0 0110.233-2.33 3 3 0 013.758 3.848A3.752 3.752 0 0118 19.5H6.75z" />
                  </svg>
                  <p class="text-base text-neutral-300">
                    Drag & drop your track or{" "}
                    <span class="font-semibold text-blue-400 hover:text-blue-300">
                      browse
                    </span>
                  </p>
                  <p class="text-xs text-neutral-500">
                    MP3, WAV, FLAC, etc. up to 50MB
                  </p>
                </div>
                {selectedFile() && (
                  <div class="mt-4 text-sm text-neutral-300 truncate px-4">
                    Selected:{" "}
                    <span class="font-medium text-white">{selectedFile()!.name}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Inputs */}
            <div class="space-y-4">
              <input
                type="text"
                value={title()}
                onInput={(e) => setTitle(e.currentTarget.value)}
                placeholder="Track Title"
                required
                class="w-full bg-gray-900/70 border border-neutral-700 text-neutral-200 placeholder-neutral-500 text-base px-4 py-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
              />
              <input
                type="text"
                value={artist()}
                onInput={(e) => setArtist(e.currentTarget.value)}
                placeholder="Artist Name"
                required
                class="w-full bg-gray-900/70 border border-neutral-700 text-neutral-200 placeholder-neutral-500 text-base px-4 py-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
              />
              <input
                type="text"
                value={album()}
                onInput={(e) => setAlbum(e.currentTarget.value)}
                placeholder="Album (Optional)"
                class="w-full bg-gray-900/70 border border-neutral-700 text-neutral-200 placeholder-neutral-500 text-base px-4 py-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
              />
            </div>

            {/* Progress Bar & Messages */}
            {(loading() || success() || error()) && (
              <div class="space-y-3 pt-2">
                {(loading() || success()) && (
                  <div class="w-full bg-neutral-800 rounded-full h-2.5 overflow-hidden">
                    <div
                      class="bg-gradient-to-r from-blue-500 to-blue-400 h-2.5 rounded-full transition-all duration-500 ease-out"
                      style={{ width: `${uploadProgress()}%` }}
                    ></div>
                  </div>
                )}
                {success() && (
                  <p class="text-center text-green-400 text-sm animate-pulse">{success()}</p>
                )}
                {error() && (
                  <p class="text-center text-red-400 text-sm">{error()}</p>
                )}
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={!selectedFile() || loading()}
              class="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold text-base py-3 rounded-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-blue-600/30"
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