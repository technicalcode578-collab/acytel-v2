import { Component, Show } from "solid-js";
import { playerState, playerActions } from "../../store/player.store";

export const Player: Component = () => {
  
  const handleScrubberChange = (e: Event) => {
    const time = parseFloat((e.currentTarget as HTMLInputElement).value);
    playerActions.seek(time);
  };
  
  const formatTime = (seconds: number) => {
    if (isNaN(seconds) || seconds === 0) return "0:00";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${String(secs).padStart(2, '0')}`;
  };

  return (
    <Show when={playerState.currentTrack()}>
      <div class="fixed bottom-0 left-0 right-0 h-20 bg-gray-800 border-t border-gray-700 text-white flex items-center px-4 z-50">
        {/* Play/Pause Button */}
        <div class="flex-grow flex items-center space-x-4">
          <button onClick={playerActions.togglePlayPause} class="text-3xl w-10 text-center disabled:text-gray-500" disabled={playerState.isLoading()}>
            {
              playerState.isLoading() ? '...' : 
              playerState.isPlaying() ? '❚❚' : '▶'
            }
          </button>
          <div>
            <p class="font-semibold">{playerState.currentTrack()?.title}</p>
            <p class="text-sm text-gray-400">{playerState.currentTrack()?.artist}</p>
          </div>
        </div>

        {/* Scrubber and Time Display */}
        <div class="w-1/2 flex items-center space-x-2 text-xs">
            <span>{formatTime(playerState.currentTime())}</span>
            <input 
                type="range" 
                min="0" 
                max={playerState.duration()} 
                value={playerState.currentTime()}
                class="w-full h-1 bg-gray-600 rounded-lg appearance-none cursor-pointer"
                onInput={handleScrubberChange}
            />
            <span>{formatTime(playerState.duration())}</span>
        </div>
        
        {/* The <audio> element is now completely gone */}
      </div>
    </Show>
  );
};
