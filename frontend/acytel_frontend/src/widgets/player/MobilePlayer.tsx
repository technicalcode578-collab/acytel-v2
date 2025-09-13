// File: src/widgets/player/MobilePlayer.tsx
import { Component, createSignal, Show } from 'solid-js';
import { playerState, playerActions } from '../../features/player/model/player.store';

export const MobilePlayer: Component = () => {
  const [isExpanded, setIsExpanded] = createSignal(false);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <Show when={playerState.currentTrack()}>
      <div 
        class={`bg-surface/95 backdrop-blur-lg border-t border-surface/50 transition-all duration-300 ${
          isExpanded() ? 'h-64' : 'h-16'
        }`}
      >
        <div 
          class="flex items-center px-4 h-16 cursor-pointer"
          onClick={() => setIsExpanded(!isExpanded())}
        >
          {/* Album Art */}
          <div class="w-10 h-10 bg-background/50 rounded-md flex-shrink-0 mr-3 flex items-center justify-center">
            <Show when={playerState.isLoading()}>
              <svg class="animate-spin w-5 h-5" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" stroke-opacity="0.25"/>
                <path fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
              </svg>
            </Show>
            <Show when={!playerState.isLoading()}>
              <svg width="20" height="20" viewBox="0 0 48 48" fill="none">
                <path d="M24.0002 42.0001V12.0001L42.0002 6.00009V36.0001" stroke="#A0AEC0" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M18.0002 36.0001C21.3139 36.0001 24.0002 33.3138 24.0002 30.0001C24.0002 26.6864 21.3139 24.0001 18.0002 24.0001C14.6865 24.0001 12.0002 26.6864 12.0002 30.0001C12.0002 33.3138 14.6865 36.0001 18.0002 36.0001Z" fill="#1A1C25" stroke="#A0AEC0" stroke-width="3" stroke-linejoin="round"/>
                <path d="M36.0002 30.0001C39.3139 30.0001 42.0002 27.3138 42.0002 24.0001C42.0002 20.6864 39.3139 18.0001 36.0002 18.0001C32.6865 18.0001 30.0002 20.6864 30.0002 24.0001C30.0002 27.3138 32.6865 30.0001 36.0002 30.0001Z" fill="#1A1C25" stroke="#A0AEC0" stroke-width="3" stroke-linejoin="round"/>
              </svg>
            </Show>
          </div>

          {/* Track Info */}
          <div class="flex-grow min-w-0 mr-3">
            <p class="text-sm font-semibold text-primary-text truncate">{playerState.currentTrack()?.title || 'Unknown'}</p>
            <p class="text-xs text-secondary-text truncate">{playerState.currentTrack()?.artist || 'Unknown Artist'}</p>
          </div>

          {/* Play/Pause Button */}
          <button 
            class="p-2 hover:bg-surface/50 rounded-full transition-colors mr-2 disabled:opacity-50"
            onClick={(e) => {
              e.stopPropagation();
              playerActions.togglePlayPause();
            }}
            disabled={playerState.isLoading()}
          >
            <Show 
              when={playerState.isPlaying()} 
              fallback={
                <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
                  <path d="M8 5V19L19 12L8 5Z"/>
                </svg>
              }
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
                <path d="M9 7H11V17H9V7ZM13 7H15V17H13V7Z"/>
              </svg>
            </Show>
          </button>

          {/* Expand/Collapse */}
          <button class="p-1">
            <svg 
              width="16" 
              height="16" 
              viewBox="0 0 24 24" 
              fill="none"
              class={`transition-transform duration-300 ${isExpanded() ? 'rotate-180' : ''}`}
            >
              <path d="M7 10L12 15L17 10" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
            </svg>
          </button>
        </div>

        {/* Expanded View */}
        <Show when={isExpanded()}>
          <div class="px-4 pb-4">
            {/* Progress Bar */}
            <Show when={playerState.duration() > 0}>
              <div class="mt-4">
                <div class="flex items-center justify-between text-xs text-muted mb-2">
                  <span>{formatTime(playerState.currentTime())}</span>
                  <span>{formatTime(playerState.duration())}</span>
                </div>
                <div 
                  class="h-1 bg-surface rounded-full overflow-hidden cursor-pointer"
                  onClick={(e) => {
                    if (playerState.isSeekable()) {
                      const rect = e.currentTarget.getBoundingClientRect();
                      const x = e.clientX - rect.left;
                      const percentage = x / rect.width;
                      const seekTime = percentage * playerState.duration();
                      playerActions.seek(seekTime);
                    }
                  }}
                >
                  <div 
                    class="h-full bg-accent rounded-full transition-all duration-75"
                    style={{ width: `${(playerState.currentTime() / playerState.duration()) * 100}%` }}
                  />
                </div>
              </div>
            </Show>

            {/* Expanded Controls */}
            <div class="flex items-center justify-center gap-8 mt-6">
              <button class="p-2 hover:scale-110 transition-transform">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="white">
                  <path d="M18 17L11 12.5V17H9V7H11V11.5L18 7V17Z"/>
                </svg>
              </button>
              <button 
                class="p-3 bg-white/10 rounded-full hover:bg-white/20 transition-colors disabled:opacity-50"
                onClick={() => playerActions.togglePlayPause()}
                disabled={playerState.isLoading()}
              >
                <Show 
                  when={playerState.isPlaying()} 
                  fallback={
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="white">
                      <path d="M8 5V19L19 12L8 5Z"/>
                    </svg>
                  }
                >
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="white">
                    <path d="M9 7H11V17H9V7ZM13 7H15V17H13V7Z"/>
                  </svg>
                </Show>
              </button>
              <button class="p-2 hover:scale-110 transition-transform">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="white">
                  <path d="M6 7L13 11.5V7H15V17H13V12.5L6 17V7Z"/>
                </svg>
              </button>
            </div>
          </div>
        </Show>
      </div>
    </Show>
  );
};