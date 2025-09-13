// File: src/widgets/player/NowPlaying.tsx
import { Component, Show } from 'solid-js';
import { playerState, playerActions } from '../../features/player/model/player.store';

const IconPlayerPrevious = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="white" xmlns="http://www.w3.org/2000/svg">
    <path d="M18 17L11 12.5V17H9V7H11V11.5L18 7V17Z"/>
  </svg>
);

const IconPlayerPlay = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="white" xmlns="http://www.w3.org/2000/svg">
    <path d="M8 5V19L19 12L8 5Z"/>
  </svg>
);

const IconPlayerPause = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="white" xmlns="http://www.w3.org/2000/svg">
    <path d="M9 7H11V17H9V7ZM13 7H15V17H13V7Z"/>
  </svg>
);

const IconPlayerNext = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="white" xmlns="http://www.w3.org/2000/svg">
    <path d="M6 7L13 11.5V7H15V17H13V12.5L6 17V7Z"/>
  </svg>
);

const IconStylizedMusicNote = () => (
    <svg width="32" height="32" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M24.0002 42.0001V12.0001L42.0002 6.00009V36.0001" stroke="#A0AEC0" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
        <path d="M18.0002 36.0001C21.3139 36.0001 24.0002 33.3138 24.0002 30.0001C24.0002 26.6864 21.3139 24.0001 18.0002 24.0001C14.6865 24.0001 12.0002 26.6864 12.0002 30.0001C12.0002 33.3138 14.6865 36.0001 18.0002 36.0001Z" fill="#1A1C25" stroke="#A0AEC0" stroke-width="3" stroke-linejoin="round"/>
        <path d="M36.0002 30.0001C39.3139 30.0001 42.0002 27.3138 42.0002 24.0001C42.0002 20.6864 39.3139 18.0001 36.0002 18.0001C32.6865 18.0001 30.0002 20.6864 30.0002 24.0001C30.0002 27.3138 32.6865 30.0001 36.0002 30.0001Z" fill="#1A1C25" stroke="#A0AEC0" stroke-width="3" stroke-linejoin="round"/>
    </svg>
);

const LoadingSpinner = () => (
  <svg class="animate-spin" width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" stroke-opacity="0.25"/>
    <path fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
  </svg>
);

export const NowPlaying: Component = () => {
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div class="bg-surface rounded-lg p-3 flex flex-col gap-3">
      <Show
        when={playerState.currentTrack()}
        fallback={
          <div class="flex items-center gap-3 opacity-50">
            <div class="w-14 h-14 bg-background/50 backdrop-blur-sm rounded-md flex items-center justify-center flex-shrink-0">
              <IconStylizedMusicNote />
            </div>
            <div class="flex-grow">
              <p class="font-bold text-primary-text">No track playing</p>
              <p class="text-sm text-secondary-text -mt-1">Select a track to play</p>
            </div>
          </div>
        }
      >
        <div class="flex items-center gap-3">
          <div class="w-14 h-14 bg-background/50 backdrop-blur-sm rounded-md flex items-center justify-center flex-shrink-0">
            <Show when={playerState.isLoading()}>
              <LoadingSpinner />
            </Show>
            <Show when={!playerState.isLoading()}>
              <IconStylizedMusicNote />
            </Show>
          </div>
          <div class="flex-grow">
            <p class="font-bold text-primary-text">{playerState.currentTrack()?.title || 'Unknown'}</p>
            <p class="text-sm text-secondary-text -mt-1">{playerState.currentTrack()?.artist || 'Unknown Artist'}</p>
          </div>
        </div>
        
        {/* Progress Bar */}
        <Show when={playerState.duration() > 0}>
          <div class="w-full">
            <div class="flex justify-between text-xs text-secondary-text mb-1">
              <span>{formatTime(playerState.currentTime())}</span>
              <span>{formatTime(playerState.duration())}</span>
            </div>
            <div 
              class="w-full h-1 bg-background/50 rounded-full cursor-pointer"
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

        <div class="flex items-center justify-center gap-6">
          <button class="text-primary-text transition-opacity hover:opacity-75"><IconPlayerPrevious /></button>
          <button 
            class="text-primary-text transition-opacity hover:opacity-75 disabled:opacity-50"
            onClick={() => playerActions.togglePlayPause()}
            disabled={playerState.isLoading()}
          >
            <Show when={playerState.isPlaying()} fallback={<IconPlayerPlay />}>
              <IconPlayerPause />
            </Show>
          </button>
          <button class="text-primary-text transition-opacity hover:opacity-75"><IconPlayerNext /></button>
        </div>
      </Show>
    </div>
  );
};