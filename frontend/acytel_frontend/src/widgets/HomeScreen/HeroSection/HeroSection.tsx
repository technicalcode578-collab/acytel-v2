// File: src/widgets/HomeScreen/HeroSection/HeroSection.tsx
import { Component, createSignal, Show } from 'solid-js';

interface HeroSectionProps {
  title: string;
  subtitle?: string;
  description?: string;
  backgroundImage: string;
  backgroundPosition?: string;
  onPlayClick?: () => void;
  loading?: boolean;
}

export const HeroSection: Component<HeroSectionProps> = (props) => {
  const [isPlaying, setIsPlaying] = createSignal(false);

  const handlePlayClick = () => {
    setIsPlaying(true);
    if (props.onPlayClick) {
      props.onPlayClick();
    }
    setTimeout(() => setIsPlaying(false), 2000); // Reset after 2s
  };

  return (
    <Show
      when={!props.loading}
      fallback={
        <div class="h-96 bg-surface/30 rounded-2xl animate-pulse flex items-end p-8">
          <div class="space-y-4">
            <div class="h-16 bg-white/10 rounded w-3/4"></div>
            <div class="h-4 bg-white/10 rounded w-1/2"></div>
            <div class="h-4 bg-white/10 rounded w-2/3"></div>
            <div class="h-12 bg-white/10 rounded w-40"></div>
          </div>
        </div>
      }
    >
      <div 
        class="relative h-96 w-full rounded-2xl bg-cover overflow-hidden flex items-end p-8 transition-opacity duration-500 ease-in-out opacity-100"
        style={{ 
          "background-image": `url(${props.backgroundImage})`,
          "background-position": props.backgroundPosition || "center" 
        }}
      >
        <div class="absolute inset-0 bg-gradient-to-t from-background/80 via-background/40 to-transparent"></div>
        <div class="relative z-10 flex flex-col gap-4">
          <div>
            <h1 class="text-7xl font-bold text-primary-text -translate-y-10">{props.title}</h1>
            {props.subtitle && <p class="text-sm text-secondary-text mt-2">{props.subtitle}</p>}
          </div>
          {props.description && (
            <p class="max-w-xl text-sm text-secondary-text">{props.description}</p>
          )}
          <button 
            onClick={handlePlayClick}
            class={`
              flex items-center gap-3 transition-all duration-300 w-max px-6 py-2 rounded-full font-bold transform hover:scale-105
              ${isPlaying() 
                ? 'bg-accent text-primary-text' 
                : 'bg-white/10 hover:bg-white/20 text-primary-text'
              }
            `}
          >
            {isPlaying() ? 'Playing...' : 'Listen Now'}
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="12" cy="12" r="10" stroke="white" stroke-width="1.5"/>
              <path d="M10 8L15 12L10 16V8Z" fill="white"/>
            </svg>
          </button>
        </div>
      </div>
    </Show>
  );
};