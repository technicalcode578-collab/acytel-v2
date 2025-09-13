// File: src/features/library/ui/TrackList.tsx
import { Component, For, Show, createSignal, onMount } from "solid-js";
import { Motion } from "solid-motion";
import { staggerContainer, staggerItem } from "../../../shared/lib/motion";
import { libraryStore } from "../../../entities/track/model/track.store";
import { playerActions, playerState } from "../../player/model/player.store";
import { getTracks } from "../../../entities/track/api/track.api";
import { Track } from "../../../entities/track/model/track.model";
import { AddToPlaylistModal } from "../../playlist/ui/AddToPlaylistModal";

export const TrackList: Component = () => {
    const [isModalOpen, setIsModalOpen] = createSignal(false);
    const [selectedTrack, setSelectedTrack] = createSignal<Track | null>(null);
    const [loading, setLoading] = createSignal(true);
    const [error, setError] = createSignal("");

    onMount(async () => {
        try {
            const tracks = await getTracks();
            libraryStore.setTracks(tracks);
        } catch (err) {
            console.error('Failed to load tracks:', err);
            setError("Failed to load your library. Please try refreshing the page.");
        } finally {
            setLoading(false);
        }
    });

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

    const formatDuration = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    return (
        <div>
            <h2 class="text-2xl font-bold mb-4">Your Library</h2>
            
            <Show when={loading()}>
                <div class="flex items-center justify-center py-8">
                    <svg class="animate-spin h-8 w-8 text-white" viewBox="0 0 24 24">
                        <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" stroke-opacity="0.25"/>
                        <path fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                    </svg>
                    <span class="ml-2 text-gray-400">Loading your library...</span>
                </div>
            </Show>

            <Show when={error()}>
                <div class="p-4 bg-red-900/50 border border-red-500 rounded-lg mb-4">
                    <p class="text-red-200">{error()}</p>
                </div>
            </Show>

            <Show 
                when={!loading() && libraryStore.tracks.length > 0} 
                fallback={
                    <Show when={!loading() && !error()}>
                        <p class="text-gray-400">Your library is empty. Upload a track to get started.</p>
                    </Show>
                }
            >
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
                                class={`p-4 rounded-lg flex justify-between items-center border cursor-pointer transition-all ${
                                    playerState.currentTrack()?.id === track.id
                                        ? 'bg-accent/20 border-accent'
                                        : 'bg-gray-800 border-gray-700 hover:bg-gray-700'
                                }`}
                                initial={staggerItem.hidden}
                                animate={staggerItem.visible}
                                exit={staggerItem.hidden}
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                            >
                                <div class="flex-grow flex items-center" onClick={() => handlePlay(track)}>
                                    <div class="mr-4">
                                        <Show 
                                            when={playerState.currentTrack()?.id === track.id && playerState.isPlaying()} 
                                            fallback={
                                                <div class="w-10 h-10 bg-gray-700 rounded-md flex items-center justify-center">
                                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="white">
                                                        <path d="M8 5V19L19 12L8 5Z"/>
                                                    </svg>
                                                </div>
                                            }
                                        >
                                            <div class="w-10 h-10 bg-accent/20 rounded-md flex items-center justify-center">
                                                <svg class="animate-pulse" width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                                                    <path d="M12 2L13.09 8.26L19 9L13.09 9.74L12 16L10.91 9.74L5 9L10.91 8.26L12 2Z"/>
                                                </svg>
                                            </div>
                                        </Show>
                                    </div>
                                    <div>
                                        <p class="font-semibold text-white">{track.title}</p>
                                        <p class="text-sm text-gray-400">{track.artist}</p>
                                    </div>
                                </div>
                                <div class="flex items-center space-x-4 flex-shrink-0">
                                    <span class="text-sm text-gray-500 hidden sm:block">
                                        {formatDuration(track.durationInSeconds)}
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