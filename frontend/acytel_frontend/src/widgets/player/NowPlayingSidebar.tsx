// File: src/features/player/ui/NowPlayingSidebar.tsx
import { Component, Show } from 'solid-js';
import { playerState, playerActions } from '../model/player.store';

export const NowPlayingSidebar: Component = () => {
  const formatTime = (time: number) => {
    if (isNaN(time) || time === 0) return "0:00";
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60).toString().padStart(2, '0');
    return `${minutes}:${seconds}`;
  };

  const handleSeek = (e: Event) => {
    const target = e.target as HTMLInputElement;
    playerActions.seek(parseFloat(target.value));
  };

  return (
    <aside class="w-80 bg-brand-black p-6 flex flex-col space-y-6 flex-shrink-0 border-l border-brand-gray">
      <div class="flex items-center justify-between">
        <h3 class="font-bold text-brand-white">Now Playing</h3>
        <button class="text-gray-400 hover:text-brand-white">⏏️</button>
      </div>
      <Show when={playerState.currentTrack()} keyed fallback={<div class="flex-1 text-gray-500">No track selected.</div>}>
        {(track) => (
          <>
            <div class="text-center">
              <img src={`https://placehold.co/256x256/121212/FFFFFF?text=${track.title[0]}`} alt={track.title} class="w-full rounded-lg mb-4" />
              <h2 class="text-xl font-bold text-brand-white">{track.title}</h2>
              <p class="text-gray-400">{track.artist}</p>
            </div>

            {/* Progress Bar */}
            <div class="space-y-1">
                <input
                    type="range"
                    min="0"
                    max={playerState.duration() || 100}
                    value={playerState.currentTime()}
                    onInput={handleSeek}
                    disabled={!playerState.isSeekable()}
                    class="w-full h-1 bg-brand-light-gray rounded-lg appearance-none cursor-pointer"
                />
              <div class="flex justify-between text-xs text-gray-400">
                <span>{formatTime(playerState.currentTime())}</span>
                <span>{formatTime(playerState.duration())}</span>
              </div>
            </div>

            {/* Controls */}
            <div class="flex items-center justify-center space-x-6">
              <button class="text-gray-400 hover:text-brand-white">🔀</button>
              <button class="text-gray-400 hover:text-brand-white">⏮️</button>
              <button onClick={playerActions.togglePlayPause} class="bg-brand-green text-brand-black rounded-full w-12 h-12 flex items-center justify-center text-2xl">
                {playerState.isPlaying() ? '❚❚' : '▶'}
              </button>
              <button class="text-gray-400 hover:text-brand-white">⏭️</button>
              <button class="text-gray-400 hover:text-brand-white">🔁</button>
            </div>
          </>
        )}
      </Show>
    </aside>
  );
};