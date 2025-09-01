import { Component, For, Show, createSignal } from "solid-js";
import { libraryStore } from "../../store/library.store";
import { playerActions } from "../../store/player.store"; // Import player actions
import { Track } from "../../models/track";
import { AddToPlaylistModal } from "../playlist/AddToPlaylistModal";

export const TrackList: Component = () => {
    const [isModalOpen, setIsModalOpen] = createSignal(false);
    const [selectedTrack, setSelectedTrack] = createSignal<Track | null>(null);

    const handlePlay = (track: Track) => {
        playerActions.playTrack(track); // Call the action to start playback
    };

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
            <h2 class="text-2xl font-bold mb-4">Your Library</h2>
            <Show when={libraryStore.tracks.length > 0} /* ... */>
                <ul class="space-y-3">
                    <For each={libraryStore.tracks}>
                        {(track) => (
                            <li class="bg-gray-800 p-4 rounded-lg flex justify-between items-center border border-gray-700">
                                <div>
                                    <p class="font-semibold text-white">{track.title}</p>
                                    <p class="text-sm text-gray-400">{track.artist}</p>
                                </div>
                                <div class="flex items-center space-x-4">
                                    <span class="text-sm text-gray-500">
                                        {Math.floor(track.durationInSeconds / 60)}:{String(track.durationInSeconds % 60).padStart(2, '0')}
                                    </span>
                                    <button onClick={() => handlePlay(track)} class="px-3 py-1 text-sm bg-blue-600 hover:bg-blue-700 rounded-full">
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