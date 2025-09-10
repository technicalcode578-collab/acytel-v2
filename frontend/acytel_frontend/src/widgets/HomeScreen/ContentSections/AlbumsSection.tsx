// File: src/widgets/HomeScreen/ContentSections/AlbumsSection.tsx
import { Component, For, createSignal, onMount, Show } from 'solid-js';
import { AlbumCard } from '../../../shared/ui/molecules/MediaCard/AlbumCard';
import { Heading } from '../../../shared/ui/atoms/Typography/Heading';

// --- Types ---
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
  columns?: 2 | 3 | 4 | 5 | 6;
  showMeta?: boolean;
  loading?: boolean;
  loadingCount?: number;
  viewAllHref?: string;
  onAlbumClick?: (albumId: string | number) => void;
  onPlayAlbum?: (albumId: string | number) => void;
  onViewAllClick?: () => void;
}

// --- Grid Configuration ---
const gridStyles = {
  2: 'grid-cols-2',
  3: 'grid-cols-3',
  4: 'grid-cols-4',
  5: 'grid-cols-5',
  6: 'grid-cols-6'
};

const responsiveGridStyles = {
  2: 'grid-cols-1 sm:grid-cols-2',
  3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
  4: 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-4',
  5: 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5',
  6: 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6'
};

// --- Section Header Component ---
const SectionHeader: Component<{
  title: string;
  subtitle?: string;
  viewAllHref?: string;
  onViewAllClick?: () => void;
}> = (props) => {
  const handleViewAllClick = (e: MouseEvent) => {
    e.preventDefault();
    if (props.onViewAllClick) {
      props.onViewAllClick();
    }
  };

  return (
    <div class="flex items-end justify-between mb-6">
      <div class="space-y-1">
        <Heading level="h2" color="primary" class="tracking-tight">
          {props.title}
        </Heading>
        {props.subtitle && (
          <Heading level="h4" color="secondary" weight="medium">
            {props.subtitle}
          </Heading>
        )}
      </div>
      
      {(props.viewAllHref || props.onViewAllClick) && (
        <button
          onClick={handleViewAllClick}
          class="flex items-center gap-2 text-sm text-secondary-text hover:text-primary-text transition-colors group"
        >
          View All
          <svg 
            width="16" 
            height="16" 
            viewBox="0 0 24 24" 
            fill="none" 
            class="transition-transform group-hover:translate-x-1"
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
      )}
    </div>
  );
};

// --- Loading Grid Component ---
const LoadingGrid: Component<{ 
  columns: number; 
  count: number 
}> = (props) => {
  const skeletonItems = Array.from({ length: props.count }, (_, i) => i);

  return (
    <div class={`grid gap-6 ${responsiveGridStyles[props.columns as keyof typeof responsiveGridStyles]}`}>
      <For each={skeletonItems}>
        {() => (
          <div class="bg-surface/30 rounded-lg p-4 animate-pulse">
            <div class="aspect-square bg-surface/50 rounded-md mb-4"></div>
            <div class="h-4 bg-surface/50 rounded mb-2 w-3/4"></div>
            <div class="h-3 bg-surface/50 rounded w-1/2"></div>
          </div>
        )}
      </For>
    </div>
  );
};

// --- Empty State Component ---
const EmptyState: Component<{ 
  title?: string;
  message?: string;
}> = (props) => (
  <div class="flex flex-col items-center justify-center py-16 text-center">
    <div class="w-16 h-16 mb-4 rounded-full bg-surface/50 flex items-center justify-center">
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" class="text-muted">
        <path 
          d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"
          fill="currentColor"
        />
      </svg>
    </div>
    <Heading level="h3" color="muted" class="mb-2">
      {props.title || 'No Albums Found'}
    </Heading>
    <p class="text-sm text-muted max-w-md">
      {props.message || 'There are no albums to display at the moment. Check back later for new content.'}
    </p>
  </div>
);

// --- Intersection Observer Hook for Animations ---
const useIntersectionObserver = () => {
  const [isVisible, setIsVisible] = createSignal(false);
  let elementRef: HTMLElement | undefined;

  onMount(() => {
    if (!elementRef) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(entry.target);
        }
      },
      { threshold: 0.1, rootMargin: '50px' }
    );

    observer.observe(elementRef);

    return () => observer.disconnect();
  });

  return { 
    isVisible, 
    elementRef: (el: HTMLElement) => {
      elementRef = el;
    }
  };
};

// --- Main Albums Section Component ---
export const AlbumsSection: Component<AlbumsSectionProps> = (props) => {
  const columns = () => props.columns || 4;
  const title = () => props.title || 'Albums';
  const loadingCount = () => props.loadingCount || 8;
  const showMeta = () => props.showMeta ?? false;
  
  const { isVisible, elementRef } = useIntersectionObserver();

  const handleAlbumClick = (albumId: string | number) => {
    if (props.onAlbumClick) {
      props.onAlbumClick(albumId);
    }
  };

  const handlePlayAlbum = (albumId: string | number) => {
    if (props.onPlayAlbum) {
      props.onPlayAlbum(albumId);
    }
  };

  return (
    <section 
      ref={elementRef}
      class={`
        transition-all duration-700 ease-out
        ${isVisible() ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}
      `}
    >
      {/* Section Header */}
      <SectionHeader 
        title={title()}
        subtitle={props.subtitle}
        viewAllHref={props.viewAllHref}
        onViewAllClick={props.onViewAllClick}
      />

      {/* Content */}
      <Show
        when={!props.loading}
        fallback={<LoadingGrid columns={columns()} count={loadingCount()} />}
      >
        <Show
          when={props.albums && props.albums.length > 0}
          fallback={<EmptyState />}
        >
          <div 
            class={`
              grid gap-6 
              ${responsiveGridStyles[columns() as keyof typeof responsiveGridStyles]}
            `}
          >
            <For each={props.albums}>
              {(album, index) => (
                <div 
                  class={`
                    transition-all duration-500 ease-out
                    ${isVisible() ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}
                  `}
                  style={{ 'transition-delay': `${index() * 100}ms` }}
                >
                  <AlbumCard 
                    album={album}
                    size="md"
                    showMeta={showMeta()}
                    onClick={handleAlbumClick}
                    onPlayClick={handlePlayAlbum}
                  />
                </div>
              )}
            </For>
          </div>
        </Show>
      </Show>
    </section>
  );
};