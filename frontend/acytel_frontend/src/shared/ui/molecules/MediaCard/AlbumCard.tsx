// File: src/shared/ui/molecules/MediaCard/AlbumCard.tsx
import { Component } from 'solid-js';
import { Card } from '../../atoms/Layout/Card';
import { CoverImage } from '../../atoms/Media/CoverImage';
import { Heading } from '../../atoms/Typography/Heading';

// --- Component Props Interface ---
interface AlbumCardProps {
  album: {
    id: string | number;
    title: string;
    artist: string;
    coverUrl: string;
    year?: string | number;
    trackCount?: number;
  };
  size?: 'sm' | 'md' | 'lg';
  layout?: 'vertical' | 'horizontal';
  showMeta?: boolean;
  loading?: boolean;
  onClick?: (albumId: string | number) => void;
  onPlayClick?: (albumId: string | number) => void;
}

// --- Size Configurations ---
const sizeConfigs = {
  sm: {
    imageSize: 'md' as const,
    titleLevel: 'h4' as const,
    gap: 'gap-2'
  },
  md: {
    imageSize: 'lg' as const,
    titleLevel: 'h3' as const,
    gap: 'gap-4'
  },
  lg: {
    imageSize: 'xl' as const,
    titleLevel: 'h2' as const,
    gap: 'gap-6'
  }
};

// --- Play Overlay Component ---
const PlayOverlay: Component<{ onPlay: () => void }> = (props) => (
  <div class="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
    <button 
      onClick={(e) => {
        e.stopPropagation();
        props.onPlay();
      }}
      class="w-12 h-12 bg-white/90 hover:bg-white rounded-full flex items-center justify-center transition-all duration-200 hover:scale-110"
    >
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M8 5V19L19 12L8 5Z" fill="#0B0D13"/>
      </svg>
    </button>
  </div>
);

// --- Meta Information Component ---
const AlbumMeta: Component<{ year?: string | number; trackCount?: number }> = (props) => {
  const metaItems = () => {
    const items = [];
    if (props.year) items.push(props.year.toString());
    if (props.trackCount) items.push(`${props.trackCount} tracks`);
    return items;
  };

  return (
    <div class="text-xs text-muted">
      {metaItems().join(' • ')}
    </div>
  );
};

// --- Main Component ---
export const AlbumCard: Component<AlbumCardProps> = (props) => {
  const size = () => props.size || 'md';
  const layout = () => props.layout || 'vertical';
  const showMeta = () => props.showMeta ?? false;
  
  const config = () => sizeConfigs[size()];
  
  const handleCardClick = () => {
    if (props.onClick) {
      props.onClick(props.album.id);
    }
  };
  
  const handlePlayClick = () => {
    if (props.onPlayClick) {
      props.onPlayClick(props.album.id);
    }
  };

  const containerClass = () => layout() === 'horizontal' ? 'flex items-center gap-4' : `flex flex-col ${config().gap}`;

  return (
    <Card 
      variant="default" 
      padding="md"
      hoverable={true}
      clickable={!!props.onClick}
      loading={props.loading}
      onClick={handleCardClick}
      class="group"
    >
      <div class={containerClass()}>
        {/* Album Cover with Play Overlay */}
        <div class="relative flex-shrink-0">
          <CoverImage 
            src={props.album.coverUrl}
            alt={`${props.album.title} by ${props.album.artist}`}
            size={layout() === 'horizontal' ? 'md' : config().imageSize}
            aspectRatio="square"
            rounded="md"
            loading="lazy"
          />
          {props.onPlayClick && <PlayOverlay onPlay={handlePlayClick} />}
        </div>

        {/* Album Information */}
        <div class={`${layout() === 'horizontal' ? 'flex-grow' : ''} min-w-0`}>
          <Heading 
            level={config().titleLevel}
            color="primary"
            truncate={true}
            class="mb-1"
          >
            {props.album.title}
          </Heading>
          
          <Heading 
            level="h4"
            color="secondary"
            weight="medium"
            truncate={true}
            class="mb-1"
          >
            {props.album.artist}
          </Heading>
          
          {showMeta() && (
            <AlbumMeta 
              year={props.album.year}
              trackCount={props.album.trackCount}
            />
          )}
        </div>
      </div>
    </Card>
  );
};
