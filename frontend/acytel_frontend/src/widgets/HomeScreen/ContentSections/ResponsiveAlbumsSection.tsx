// File: src/widgets/HomeScreen/ContentSections/ResponsiveAlbumsSection.tsx
import { Component, For, Show } from 'solid-js';
import { Heading } from '../../../shared/ui/atoms/Typography/Heading';

interface Album {
  id: string | number;
  title: string;
  artist: string;
  coverUrl: string;
  year?: string | number;
  trackCount?: number;
}

interface AlbumsSectionProps {
  title?: string;
  subtitle?: string;
  albums: Album[];
  columns?: number;
  showMeta?: boolean;
  loading?: boolean;
  onAlbumClick?: (albumId: string | number) => void;
  onPlayAlbum?: (albumId: string | number) => void;
  onViewAllClick?: () => void;
  viewport?: string;
}

// Responsive Album Card Component
const ResponsiveAlbumCard: Component<{
  album: Album;
  showMeta: boolean;
  viewport: string;
  onClick?: () => void;
  onPlay?: () => void;
}> = (props) => {
  const isMobile = () => props.viewport === 'mobile';
  
  return (
    <div 
      class="group relative bg-surface/50 hover:bg-surface rounded-lg overflow-hidden transition-all duration-300 hover:scale-[1.02] cursor-pointer"
      onClick={props.onClick}
    >
      {/* Cover Image */}
      <div class="relative aspect-square">
        <img 
          src={props.album.coverUrl}
          alt={`${props.album.title} by ${props.album.artist}`}
          class="w-full h-full object-cover"
          loading="lazy"
        />
        
        {/* Play Overlay */}
        <Show when={props.onPlay && !isMobile()}>
          <div class="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
            <button 
              onClick={(e) => {
                e.stopPropagation();
                props.onPlay?.();
              }}
              class="w-12 h-12 bg-white/90 hover:bg-white rounded-full flex items-center justify-center transition-all duration-200 hover:scale-110"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path d="M8 5V19L19 12L8 5Z" fill="#0B0D13"/>
              </svg>
            </button>
          </div>
        </Show>
      </div>
      
      {/* Album Info */}
      <div class={`${isMobile() ? 'p-2' : 'p-3 sm:p-4'}`}>
        <h3 class={`font-bold text-primary-text truncate ${isMobile() ? 'text-xs' : 'text-sm sm:text-base'}`}>
          {props.album.title}
        </h3>
        <p class={`text-secondary-text truncate ${isMobile() ? 'text-xs' : 'text-xs sm:text-sm'}`}>
          {props.album.artist}
        </p>
        
        {/* Metadata */}
        <Show when={props.showMeta && !isMobile()}>
          <div class="text-xs text-muted mt-1">
            {props.album.year && <span>{props.album.year}</span>}
            {props.album.year && props.album.trackCount && <span> • </span>}
            {props.album.trackCount && <span>{props.album.trackCount} tracks</span>}
          </div>
        </Show>
      </div>
    </div>
  );
};

// Section Header
const SectionHeader: Component<{
  title: string;
  subtitle?: string;
  onViewAllClick?: () => void;
  viewport: string;
}> = (props) => {
  const isMobile = () => props.viewport === 'mobile';
  
  return (
    <div class="flex items-end justify-between mb-4 sm:mb-6">
      <div class="space-y-1">
        <h2 class={`font-bold text-primary-text ${isMobile() ? 'text-lg' : 'text-xl sm:text-2xl'}`}>
          {props.title}
        </h2>
        <Show when={props.subtitle}>
          <p class="text-xs sm:text-sm text-secondary-text">
            {props.subtitle}
          </p>
        </Show>
      </div>
      
      <Show when={props.onViewAllClick}>
        <button
          onClick={props.onViewAllClick}
          class="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm text-secondary-text hover:text-primary-text transition-colors group"
        >
          <span class="hidden sm:inline">View All</span>
          <span class="sm:hidden">All</span>
          <svg 
            width="14" 
            height="14" 
            viewBox="0 0 24 24" 
            fill="none" 
            class="sm:w-4 sm:h-4 transition-transform group-hover:translate-x-1"
          >
            <path 
              d="M10 17L15 12L10 7" 
              stroke="currentColor" 
              stroke-width="2" 
              stroke-linecap="round" 
              stroke-linejoin="round"
            />
          </svg>
        </button>
      </Show>
    </div>
  );
};

// Loading Skeleton
const LoadingSkeleton: Component<{ columns: number; viewport: string }> = (props) => {
  const items = Array.from({ length: props.columns }, (_, i) => i);
  const gridClass = () => {
    switch(props.columns) {
      case 2: return 'grid-cols-2';
      case 3: return 'grid-cols-3';
      case 4: return 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-4';
      default: return 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-4';
    }
  };
  
  return (
    <div class={`grid ${gridClass()} gap-3 sm:gap-4 lg:gap-6`}>
      <For each={items}>
        {() => (
          <div class="bg-surface/30 rounded-lg animate-pulse">
            <div class="aspect-square bg-surface/50 rounded-t-lg"></div>
            <div class="p-3">
              <div class="h-4 bg-surface/50 rounded mb-2 w-3/4"></div>
              <div class="h-3 bg-surface/50 rounded w-1/2"></div>
            </div>
          </div>
        )}
      </For>
    </div>
  );
};

// Main Component
export const AlbumsSection: Component<AlbumsSectionProps> = (props) => {
  const viewport = () => props.viewport || 'desktop';
  const showMeta = () => props.showMeta ?? false;
  
  const getGridClass = () => {
    const cols = props.columns || 4;
    switch(cols) {
      case 2: return 'grid-cols-2 gap-3 sm:gap-4';
      case 3: return 'grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4 lg:gap-6';
      case 4: return 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6';
      default: return 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6';
    }
  };

  return (
    <section class="w-full">
      {/* Header */}
      <SectionHeader 
        title={props.title || 'Albums'}
        subtitle={props.subtitle}
        onViewAllClick={props.onViewAllClick}
        viewport={viewport()}
      />

      {/* Content */}
      <Show
        when={!props.loading}
        fallback={<LoadingSkeleton columns={props.columns || 4} viewport={viewport()} />}
      >
        <div class={`grid ${getGridClass()}`}>
          <For each={props.albums}>
            {(album) => (
              <ResponsiveAlbumCard 
                album={album}
                showMeta={showMeta()}
                viewport={viewport()}
                onClick={() => props.onAlbumClick?.(album.id)}
                onPlay={() => props.onPlayAlbum?.(album.id)}
              />
            )}
          </For>
        </div>
      </Show>
    </section>
  );
};