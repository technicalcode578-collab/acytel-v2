// File: src/widgets/player/MobilePlayer.tsx
import { Component, createSignal } from 'solid-js';

export const MobilePlayer: Component = () => {
  const [isExpanded, setIsExpanded] = createSignal(false);

  return (
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
        <div class="w-10 h-10 bg-background/50 rounded-md flex-shrink-0 mr-3">
          <img 
            src="https://i.pravatar.cc/40?img=10" 
            alt="Now Playing" 
            class="w-full h-full rounded-md object-cover"
          />
        </div>

        {/* Track Info */}
        <div class="flex-grow min-w-0 mr-3">
          <p class="text-sm font-semibold text-primary-text truncate">Khariyat</p>
          <p class="text-xs text-secondary-text truncate">Rio y entvro</p>
        </div>

        {/* Play/Pause Button */}
        <button class="p-2 hover:bg-surface/50 rounded-full transition-colors mr-2">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
            <path d="M9 7H11V17H9V7ZM13 7H15V17H13V7Z"/>
          </svg>
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
      {isExpanded() && (
        <div class="px-4 pb-4">
          {/* Progress Bar */}
          <div class="mt-4">
            <div class="flex items-center justify-between text-xs text-muted mb-2">
              <span>1:23</span>
              <span>3:45</span>
            </div>
            <div class="h-1 bg-surface rounded-full overflow-hidden">
              <div class="h-full w-1/3 bg-accent rounded-full"></div>
            </div>
          </div>

          {/* Expanded Controls */}
          <div class="flex items-center justify-center gap-8 mt-6">
            <button class="p-2 hover:scale-110 transition-transform">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="white">
                <path d="M18 17L11 12.5V17H9V7H11V11.5L18 7V17Z"/>
              </svg>
            </button>
            <button class="p-3 bg-white/10 rounded-full hover:bg-white/20 transition-colors">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="white">
                <path d="M9 7H11V17H9V7ZM13 7H15V17H13V7Z"/>
              </svg>
            </button>
            <button class="p-2 hover:scale-110 transition-transform">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="white">
                <path d="M6 7L13 11.5V7H15V17H13V12.5L6 17V7Z"/>
              </svg>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};