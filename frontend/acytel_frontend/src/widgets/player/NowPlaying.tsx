import { Component } from 'solid-js';

// --- SVG Icon Components for the Player ---

const IconPlayerPrevious = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="white" xmlns="http://www.w3.org/2000/svg">
    <path d="M18 17L11 12.5V17H9V7H11V11.5L18 7V17Z"/>
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

// --- Main Exported Component ---

export const NowPlaying: Component = () => {
  return (
    <div class="bg-surface rounded-lg p-3 flex flex-col gap-3">
      <div class="flex items-center gap-3">
        <div class="w-14 h-14 bg-background/50 backdrop-blur-sm rounded-md flex items-center justify-center flex-shrink-0">
          <IconStylizedMusicNote />
        </div>
        <div class="flex-grow">
          <p class="font-bold text-primary-text">Khariyat</p>
          <p class="text-sm text-secondary-text -mt-1">Rio y entvro</p>
        </div>
      </div>
      <div class="flex items-center justify-center gap-6">
        <button class="text-primary-text transition-opacity hover:opacity-75"><IconPlayerPrevious /></button>
        <button class="text-primary-text transition-opacity hover:opacity-75"><IconPlayerPause /></button>
        <button class="text-primary-text transition-opacity hover:opacity-75"><IconPlayerNext /></button>
      </div>
    </div>
  );
};