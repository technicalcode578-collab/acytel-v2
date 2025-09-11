import { Component, For, Show } from 'solid-js';
import { NowPlaying } from '../player/NowPlaying'; // Import the new component

// --- Custom SVG Icon Components (Playlist specific) ---

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
      <NowPlaying />
    </div>
  );
};