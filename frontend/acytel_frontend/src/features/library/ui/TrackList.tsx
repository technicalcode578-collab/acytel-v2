// File: src/features/library/ui/TrackList.tsx
import { Component, For, Show, createSignal } from "solid-js";
import { Motion } from "solid-motion";
import { staggerContainer, staggerItem } from "../../../shared/lib/motion"; // CORRECTED
import { libraryStore } from "../../../entities/track/model/track.store"; // CORRECTED
import { playerActions } from "../../player/model/player.store";
import { Track } from "../../../entities/track/model/track.model";
import { AddToPlaylistModal } from "../../playlist/ui/AddToPlaylistModal";

export const TrackList: Component = () => {
    const [isModalOpen, setIsModalOpen] = createSignal(false);
    const [selectedTrack, setSelectedTrack] = createSignal<Track | null>(null);

    const handlePlay = (track: Track) => {
        playerActions.playTrack(track);
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
            <Show when={libraryStore.tracks.length > 0} fallback={<p class="text-gray-400">Your library is empty. Upload a track to get started.</p>}>
                <Motion
                    component="ul"
                    class="space-y-3"
                    initial={staggerContainer.hidden}
                    animate={staggerContainer.visible}
                    transition={staggerContainer.visible.transition}
                >
                    <For each={libraryStore.tracks}>
                        {(track) => (
                            <Motion
                                component="li"
                                class="bg-gray-800 p-4 rounded-lg flex justify-between items-center border border-gray-700 cursor-pointer"
                                initial={staggerItem.hidden}
                                animate={staggerItem.visible}
                                exit={staggerItem.hidden}
                                whileHover={{ scale: 1.02, backgroundColor: "#2D3748" }}
                                whileTap={{ scale: 0.98 }}
                            >
                                <div class="flex-grow" onClick={() => handlePlay(track)}>
                                    <p class="font-semibold text-white">{track.title}</p>
                                    <p class="text-sm text-gray-400">{track.artist}</p>
                                </div>
                                <div class="flex items-center space-x-4 flex-shrink-0">
                                    <span class="text-sm text-gray-500 hidden sm:block">
                                        {Math.floor(track.durationInSeconds / 60)}:{String(track.durationInSeconds % 60).padStart(2, '0')}
                                    </span>
                                    <button
                                        onClick={(e) => { e.stopPropagation(); openAddToPlaylistModal(track); }}
                                        class="px-3 py-1 text-sm bg-green-600 hover:bg-green-700 rounded-full z-10"
                                    >
                                        Add
                                    </button>
                                </div>
                            </Motion>
                        )}
                    </For>
                </Motion>
            </Show>
            <AddToPlaylistModal isOpen={isModalOpen()} track={selectedTrack()} onClose={closeAddToPlaylistModal} />
        </div>
    );
};