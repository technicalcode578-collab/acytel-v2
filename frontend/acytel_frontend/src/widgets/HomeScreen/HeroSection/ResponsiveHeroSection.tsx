// File: src/widgets/HomeScreen/HeroSection/ResponsiveHeroSection.tsx
import { Component, createSignal, Show } from 'solid-js';

interface HeroSectionProps {
  title: string;
  subtitle?: string;
  description?: string;
  backgroundImage: string;
  backgroundPosition?: string;
  onPlayClick?: () => void;
  loading?: boolean;
  viewport?: string;
}

export const HeroSection: Component<HeroSectionProps> = (props) => {
  const [isPlaying, setIsPlaying] = createSignal(false);

  const handlePlayClick = () => {
    setIsPlaying(true);
    if (props.onPlayClick) {
      props.onPlayClick();
    }
    setTimeout(() => setIsPlaying(false), 2000);
  };

  const getHeightClass = () => {
    switch(props.viewport) {
      case 'mobile': return 'h-64';
      case 'tablet': return 'h-80';
      default: return 'h-96';
    }
  };

  const getTitleSize = () => {
    switch(props.viewport) {
      case 'mobile': return 'text-4xl sm:text-5xl';
      case 'tablet': return 'text-5xl md:text-6xl';
      default: return 'text-6xl lg:text-7xl';
    }
  };

  const getBackgroundPosition = () => {
    if (props.viewport === 'desktop') {
      // 1cm is ~2.5rem, 3cm is ~7rem
      return 'calc(50% + 19rem) calc(5% - 0.5rem)';
    }
    if (props.viewport === 'tablet') {
      // 4cm is ~9rem
      return 'calc(5% + 15rem) calc(10% + 4rem)';
    }
    return props.backgroundPosition || "center";
  };

  return (
    <Show
      when={!props.loading}
      fallback={
        <div class={`${getHeightClass()} bg-surface/30 rounded-lg sm:rounded-xl lg:rounded-2xl animate-pulse flex items-end p-4 sm:p-6 lg:p-8`}>
          <div class="space-y-2 sm:space-y-3 lg:space-y-4 w-full">
            <div class="h-8 sm:h-12 lg:h-16 bg-white/10 rounded w-3/4"></div>
            <div class="h-3 sm:h-4 bg-white/10 rounded w-1/2"></div>
            <div class="h-3 sm:h-4 bg-white/10 rounded w-2/3"></div>
            <div class="h-10 sm:h-12 bg-white/10 rounded w-32 sm:w-40"></div>
          </div>
        </div>
      }
    >
      <div 
        class={`relative ${getHeightClass()} w-full rounded-lg sm:rounded-xl lg:rounded-2xl bg-cover overflow-hidden flex items-end p-4 sm:p-6 lg:p-8 transition-all duration-500`}
        style={{ 
          "background-image": `url(${props.backgroundImage})`,
          "background-position": getBackgroundPosition(),
          "background-size": "cover"
        }}
      >
        {/* Gradient Overlay */}
        <div class="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent sm:from-background/90 sm:via-background/40"></div>
        
        {/* Content */}
        <div class="relative z-10 flex flex-col gap-2 sm:gap-3 lg:gap-4 max-w-full">
          <div>
            <h1 class={`${getTitleSize()} font-bold text-primary-text leading-tight`}>
              {props.title}
            </h1>
            {props.subtitle && (
              <p class="text-xs sm:text-sm text-secondary-text mt-1 sm:mt-2">
                {props.subtitle}
              </p>
            )}
          </div>
          
          {/* Description - Hide on mobile */}
          <Show when={props.description && props.viewport !== 'mobile'}>
            <p class="max-w-lg lg:max-w-xl text-xs sm:text-sm text-secondary-text line-clamp-2 sm:line-clamp-3">
              {props.description}
            </p>
          </Show>
          
          {/* Play Button */}
          <button 
            onClick={handlePlayClick}
            class={`
              flex items-center gap-2 sm:gap-3 transition-all duration-300 w-max 
              px-4 sm:px-5 lg:px-6 py-2 sm:py-2.5 rounded-full 
              text-sm sm:text-base font-bold transform hover:scale-105
              ${isPlaying() 
                ? 'bg-accent text-primary-text' 
                : 'bg-white/10 hover:bg-white/20 text-primary-text backdrop-blur-sm'
              }
            `}
          >
            <span class="hidden sm:inline">{isPlaying() ? 'Playing...' : 'Listen Now'}</span>
            <span class="sm:hidden">{isPlaying() ? 'Playing' : 'Play'}</span>
            <svg 
              width="20" 
              height="20" 
              viewBox="0 0 24 24" 
              fill="none"
              class="sm:w-6 sm:h-6"
            >
              <circle cx="12" cy="12" r="10" stroke="white" stroke-width="1.5"/>
              <path d="M10 8L15 12L10 16V8Z" fill="white"/>
            </svg>
          </button>
        </div>
      </div>
    </Show>
  );
};