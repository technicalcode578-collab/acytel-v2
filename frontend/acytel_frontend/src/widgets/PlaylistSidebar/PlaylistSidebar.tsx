// File: src/widgets/PlaylistSidebar/PlaylistSidebar.tsx (Final Calibration)
import { Component, For, Show } from 'solid-js';

// --- Custom SVG Icon Components (Forged from Blueprint) ---

const IconPulsingWave = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="12" cy="12" r="10" stroke="white" stroke-opacity="0.5" stroke-width="1.5"/>
    <circle cx="12" cy="12" r="5" fill="white"/>
  </svg>
);

const IconCircularPlay = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="12" cy="12" r="11" stroke="white" stroke-width="1.5"/>
    <path d="M10 8L15 12L10 16V8Z" fill="white"/>
  </svg>
);

const IconDelicateChevron = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M10 17L15 12L10 7" stroke="#A0AEC0" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
  </svg>
);

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


// --- Data Structures ---
const placeholderPlaylists = [
  { id: 1, title: 'New Or Mж', artist: 'Goll', avatar: 'https://i.pravatar.cc/40?img=1', active: false },
  { id: 2, title: 'Ploans are Eco', artist: 'Birardre', avatar: 'https://i.pravatar.cc/40?img=2', active: true },
  { id: 3, title: 'We Don\'t Tab Aburq!', artist: 'Umaind Inam', avatar: 'https://i.pravatar.cc/40?img=3', active: false },
  { id: 4, title: 'Dlãy', artist: 'Humi Itrgoos', avatar: 'https://i.pravatar.cc/40?img=4', active: false },
  { id: 5, title: 'Staver Fionhin', artist: '#alld torfir', avatar: 'https://i.pravatar.cc/40?img=5', active: false },
];


// --- Sub-Components ---

const PlaylistItem = (props: { item: typeof placeholderPlaylists[0] }) => {
  const baseClasses = "flex items-center p-2 rounded-lg cursor-pointer transition-colors";
  const activeClasses = props.item.active ? "bg-accent" : "hover:bg-surface/50";

  return (
    <div class={`${baseClasses} ${activeClasses}`}>
      <div class="w-10 h-10 mr-4 flex items-center justify-center flex-shrink-0">
        <Show 
          when={props.item.active} 
          fallback={<img src={props.item.avatar} alt={props.item.title} class="w-10 h-10 rounded-full" />}
        >
          <IconPulsingWave />
        </Show>
      </div>
      <div class="flex-grow">
        <p class="font-bold text-primary-text text-sm tracking-tight">{props.item.title}</p>
        <p class={`text-xs ${props.item.active ? 'text-secondary-text' : 'text-muted'}`}>{props.item.artist}</p>
      </div>
      <div class="flex-shrink-0">
        {props.item.active ? <IconCircularPlay /> : <IconDelicateChevron />}
      </div>
    </div>
  );
};

const NowPlayingWidget: Component = () => {
  return (
    <div class="bg-surface rounded-lg p-3 flex flex-col gap-3">
      <div class="flex items-center gap-3">
        <div class="w-14 h-14 bg-background/50 backdrop-blur-sm rounded-md flex items-center justify-center flex-shrink-0">
          <IconStylizedMusicNote />
        </div>
        <div class="flex-grow">
          <p class="font-bold text-primary-text">Please don't go</p>
          <p class="text-sm text-secondary-text -mt-1">Rio y entvro</p>
        </div>
      </div>
      <div class="flex items-center justify-center gap-6">
        <button class="text-primary-text transition-opacity hover:opacity-75"><IconPlayerPrevious /></button>
        <button class="text-primary-text transition-opacity hover:opacity-75"><IconPlayerPause /></button>
        <button class="text-primary-text transition-opacity hover:opacity-75"><IconPlayerNext /></button>
      </div>
    </div>
  )
}


// --- Main Exported Component ---

export const PlaylistSidebar: Component = () => {
  return (
    <div class="p-4 h-full flex flex-col gap-4">
      <div>
        <h2 class="text-xl font-bold text-primary-text mb-4">Playlist</h2>
        <div class="flex flex-col gap-1">
          <For each={placeholderPlaylists}>
            {(item) => <PlaylistItem item={item} />}
          </For>
        </div>
      </div>
      <div class="flex-grow"></div>
      <NowPlayingWidget />
    </div>
  );
};