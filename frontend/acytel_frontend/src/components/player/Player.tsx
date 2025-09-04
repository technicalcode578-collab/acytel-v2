import { createEffect, onCleanup } from 'solid-js';
import { playerState, playerActions } from '../../store/player.store';

export const Player = () => {
    const formatTime = (time: number) => {
        const minutes = Math.floor(time / 60);
        const seconds = Math.floor(time % 60).toString().padStart(2, '0');
        return `${minutes}:${seconds}`;
    };

    const handleSeek = (e: Event) => {
        const target = e.target as HTMLInputElement;
        playerActions.seek(parseFloat(target.value));
    };

    // Moved createEffect inside the component to ensure proper lifecycle management.
    createEffect(() => {
        const style = document.createElement('style');
        style.textContent = `
            input[type=range]:disabled {
                cursor: not-allowed;
            }
            input[type=range]:disabled::-webkit-slider-thumb {
                background: var(--thumb-color);
            }
            input[type=range]:disabled::-moz-range-thumb {
                background: var(--thumb-color);
            }
        `;
        document.head.appendChild(style);
        onCleanup(() => document.head.removeChild(style));
    });

    return (
        <div class="fixed bottom-0 left-0 right-0 bg-gray-800 text-white p-4 flex items-center justify-between shadow-lg">
            <div class="flex items-center w-1/4">
                {playerState.currentTrack() && (
                    <>
                        <img src={`https://placehold.co/64x64/1a202c/ffffff?text=${playerState.currentTrack()?.title[0]}`} alt="Album Art" class="w-16 h-16 rounded mr-4" />
                        <div>
                            <div class="font-bold">{playerState.currentTrack()?.title}</div>
                            <div class="text-sm text-gray-400">{playerState.currentTrack()?.artist}</div>
                        </div>
                    </>
                )}
            </div>

            <div class="flex flex-col items-center justify-center w-1/2">
                <div class="flex items-center space-x-4">
                    <button class="text-2xl hover:text-gray-300">⏮️</button>
                    <button onClick={playerActions.togglePlayPause} class="text-4xl bg-green-500 rounded-full w-12 h-12 flex items-center justify-center hover:bg-green-600">
                        {playerState.isPlaying() ? '⏸️' : '▶️'}
                    </button>
                    <button class="text-2xl hover:text-gray-300">⏭️</button>
                </div>
                <div class="flex items-center w-full mt-2">
                    <span class="text-xs text-gray-400 w-12 text-right pr-2">{formatTime(playerState.currentTime())}</span>
                    <input
                        type="range"
                        min="0"
                        max={playerState.duration() || 100}
                        value={playerState.currentTime()}
                        onInput={handleSeek}
                        disabled={!playerState.isSeekable()}
                        class="w-full h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer"
                        style={{
                            '--thumb-color': playerState.isSeekable() ? '#48bb78' : '#a0aec0',
                            '--track-color': playerState.isSeekable() ? '#2d3748' : '#4a5568'
                        }}
                    />
                    <span class="text-xs text-gray-400 w-12 text-left pl-2">{formatTime(playerState.duration())}</span>
                </div>
            </div>

            <div class="w-1/4">
                {/* Volume controls or other elements can go here */}
            </div>
        </div>
    );
};