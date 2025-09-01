import { createSignal, Component } from "solid-js";
import { uploadTrack } from "../../services/track.service";
import { libraryStore } from "../../store/library.store";

export const UploadForm: Component = () => {
    const [selectedFile, setSelectedFile] = createSignal<File | null>(null);
    const [loading, setLoading] = createSignal(false);
    const [error, setError] = createSignal("");

    const handleFileChange = (e: Event) => {
        const target = e.currentTarget as HTMLInputElement;
        if (target.files && target.files[0]) {
            setSelectedFile(target.files[0]);
        }
    };

    const handleSubmit = async (e: Event) => {
        e.preventDefault();
        if (!selectedFile()) return;
        setLoading(true);
        setError("");
        try {
            const newTrack = await uploadTrack(selectedFile()!);
            // Add the new track to our global store for instant UI updates
            libraryStore.addTrack(newTrack);
            setSelectedFile(null); // Clear the input
        } catch (err) {
            setError("Upload failed. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} class="mb-8 p-4 bg-gray-800 border border-gray-700 rounded-lg">
            <h3 class="text-lg font-semibold mb-2">Upload New Track</h3>
            <div class="flex items-center space-x-4">
                <input type="file" accept="audio/*" onChange={handleFileChange} class="flex-grow text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-600 file:text-white hover:file:bg-blue-700"/>
                <button type="submit" disabled={!selectedFile() || loading()} class="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:bg-gray-500 disabled:cursor-not-allowed">
                    {loading() ? "Uploading..." : "Upload"}
                </button>
            </div>
            {error() && <p class="mt-2 text-sm text-red-400">{error()}</p>}
        </form>
    );
};