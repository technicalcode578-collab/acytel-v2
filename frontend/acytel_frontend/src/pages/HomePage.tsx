// File: src/pages/HomePage.tsx (Fortified)
import { Component, For } from 'solid-js';

// --- Custom SVG Icon for the Play Button ---
const IconPlayLibkt = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="12" cy="12" r="10" stroke="white" stroke-width="1.5"/>
        <path d="M10 8L15 12L10 16V8Z" fill="white"/>
    </svg>
);

// --- The Main Header Component ---
const AlbumHeader: Component = () => {
    const artistImageUrl = '/assets/album_header_bg.png';
    return (
        <div 
            class="relative h-96 w-full rounded-2xl bg-cover overflow-hidden flex items-end p-8"
            style={{ 
                "background-image": `url(${artistImageUrl})`,
                "background-position": "calc(50% + 7cm) calc(50% + 2.4cm)" 
            }}
        >
            <div class="absolute inset-0 bg-gradient-to-t from-background/80 via-background/40 to-transparent"></div>
            <div class="relative z-10 flex flex-col gap-4">
                <div>
                    <h1 class="text-7xl font-bold text-primary-text -translate-y-10">Acytel</h1>
                    <p class="text-sm text-secondary-text mt-2">Hindi</p>
                </div>
                <p class="max-w-xl text-sm text-secondary-text">
                    Toene: a s"euth sunt a stto years, teupa de enon menm acoef en nnt* afmenalen onreenan O. 
                    Epio am loopelansivu poc Abce. bneket onco e.
                </p>
                <button class="flex items-center gap-3 bg-white/10 hover:bg-white/20 transition-colors w-max px-6 py-2 rounded-full text-primary-text font-bold">
                    Listen Now
                    <IconPlayLibkt />
                </button>
            </div>
        </div>
    );
}

// --- Album Card Sub-Component ---
const AlbumCard = (props: { item: { coverUrl: string; title: string; artist: string; } }) => {
    return (
        <div class="bg-surface/50 p-4 rounded-lg flex flex-col gap-4 cursor-pointer hover:bg-surface transition-colors">
            <img src={props.item.coverUrl} alt={props.item.title} class="w-full aspect-square rounded-md" />
            <div>
                <p class="font-bold text-primary-text truncate">{props.item.title}</p>
                <p class="text-sm text-secondary-text truncate">{props.item.artist}</p>
            </div>
        </div>
    )
}

// --- The Album Grid Component (Fortified) ---
const AlbumGrid: Component = () => {
    // Directive: Data paths updated to use local, reliable assets.
    const albums = [
        { coverUrl: '/assets/albums/cover_1.jpg', title: 'Jea Lak Up', artist: 'Churerlia tebat' },
        { coverUrl: '/assets/albums/cover_2.jpg', title: 'Frepe Fxas', artist: 'Guomas' },
        { coverUrl: '/assets/albums/cover_3.jpg', title: 'That\'s Auring', artist: 'Guomas' },
        { coverUrl: '/assets/albums/cover_4.jpg', title: 'Latk Senmery Se', artist: 'Ruqwear ycord' },
    ];

    return (
        <div>
            <h2 class="text-2xl font-bold text-primary-text mb-4">Top Albums</h2>
            <div class="grid grid-cols-4 gap-6">
                <For each={albums}>
                    {(album) => <AlbumCard item={album} />}
                </For>
            </div>
        </div>
    )
}

// --- The Exported HomePage Component ---
export const HomePage: Component = () => {
  return (
    <div class="flex flex-col gap-8">
        <AlbumHeader />
        <AlbumGrid />
    </div>
  );
};