// File: src/shared/ui/atoms/Media/CoverImage.tsx
import { Component, createSignal, onMount } from 'solid-js';

// --- Component Props Interface ---
interface CoverImageProps {
  src: string;
  alt: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'full';
  aspectRatio?: 'square' | '4/3' | '16/9' | 'auto';
  rounded?: 'none' | 'sm' | 'md' | 'lg' | 'full';
  loading?: 'lazy' | 'eager';
  fallback?: string;
  hoverable?: boolean;
  onClick?: () => void;
  class?: string;
}

// --- Size Configurations ---
const sizeStyles = {
  xs: 'w-8 h-8',
  sm: 'w-12 h-12', 
  md: 'w-16 h-16',
  lg: 'w-24 h-24',
  xl: 'w-32 h-32',
  full: 'w-full h-full'
};

const aspectRatioStyles = {
  square: 'aspect-square',
  '4/3': 'aspect-[4/3]',
  '16/9': 'aspect-[16/9]',
  auto: ''
};

const roundedStyles = {
  none: 'rounded-none',
  sm: 'rounded-sm',
  md: 'rounded-md',
  lg: 'rounded-lg',
  full: 'rounded-full'
};

// --- Fallback Icon ---
const FallbackIcon = () => (
  <svg class="w-8 h-8 text-muted" fill="currentColor" viewBox="0 0 24 24">
    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
  </svg>
);

// --- Main Component ---
export const CoverImage: Component<CoverImageProps> = (props) => {
  const [isLoaded, setIsLoaded] = createSignal(false);
  const [hasError, setHasError] = createSignal(false);
  
  const size = () => props.size || 'md';
  const aspectRatio = () => props.aspectRatio || 'square';
  const rounded = () => props.rounded || 'md';
  const loading = () => props.loading || 'lazy';
  
  const baseClasses = 'object-cover transition-all duration-300 select-none';
  const hoverClasses = props.hoverable ? 'hover:scale-105 hover:shadow-lg cursor-pointer' : '';
  const interactionClasses = props.onClick ? 'cursor-pointer' : '';
  
  const containerClasses = () => [
    'relative overflow-hidden bg-surface flex items-center justify-center',
    sizeStyles[size()],
    aspectRatioStyles[aspectRatio()],
    roundedStyles[rounded()],
    hoverClasses,
    props.class || ''
  ].filter(Boolean).join(' ');
  
  const imageClasses = () => [
    baseClasses,
    roundedStyles[rounded()],
    'w-full h-full',
    isLoaded() ? 'opacity-100' : 'opacity-0',
    interactionClasses
  ].filter(Boolean).join(' ');

  const handleImageLoad = () => {
    setIsLoaded(true);
    setHasError(false);
  };

  const handleImageError = () => {
    setHasError(true);
    setIsLoaded(false);
  };

  const handleClick = () => {
    if (props.onClick) {
      props.onClick();
    }
  };

  return (
    <div class={containerClasses()} onClick={handleClick}>
      {/* Loading skeleton */}
      <div class={`absolute inset-0 bg-surface animate-pulse ${isLoaded() || hasError() ? 'opacity-0' : 'opacity-100'} transition-opacity duration-300`} />
      
      {/* Fallback icon when error */}
      {hasError() && !props.fallback && (
        <div class="absolute inset-0 flex items-center justify-center">
          <FallbackIcon />
        </div>
      )}
      
      {/* Fallback image */}
      {hasError() && props.fallback && (
        <img 
          src={props.fallback}
          alt={props.alt}
          class={imageClasses()}
          loading={loading()}
        />
      )}
      
      {/* Main image */}
      {!hasError() && (
        <img 
          src={props.src}
          alt={props.alt}
          class={imageClasses()}
          loading={loading()}
          onLoad={handleImageLoad}
          onError={handleImageError}
        />
      )}
    </div>
  );
};