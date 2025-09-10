// File: src/shared/ui/molecules/Content/HeroContent.tsx
import { Component, JSX } from 'solid-js';
import { MediaInfo } from './MediaInfo';
import { PlayButton } from '../../atoms/Button/PlayButton';

// --- Component Props Interface ---
interface HeroContentProps {
  title: string;
  subtitle?: string;
  description?: string;
  metadata?: string | string[];
  backgroundImage?: string;
  backgroundPosition?: string;
  gradient?: {
    from: string;
    via?: string;
    to: string;
    direction?: 'to-t' | 'to-b' | 'to-l' | 'to-r' | 'to-tl' | 'to-tr' | 'to-bl' | 'to-br';
  };
  actions?: JSX.Element;
  height?: 'sm' | 'md' | 'lg' | 'xl' | 'screen';
  contentPosition?: 'start' | 'center' | 'end';
  overlay?: boolean;
  loading?: boolean;
  onPlayClick?: () => void;
}

// --- Height Configurations ---
const heightStyles = {
  sm: 'h-64',      // 256px
  md: 'h-80',      // 320px  
  lg: 'h-96',      // 384px
  xl: 'h-[32rem]', // 512px
  screen: 'h-screen'
};

// --- Content Position Configurations ---
const positionStyles = {
  start: 'justify-start items-start',
  center: 'justify-center items-center',
  end: 'justify-end items-end'
};

// --- Default Gradient ---
const defaultGradient = {
  from: 'background/80',
  via: 'background/40',
  to: 'transparent',
  direction: 'to-t' as const
};

// --- Loading Skeleton ---
const LoadingSkeleton: Component = () => (
  <div class="animate-pulse space-y-4 z-10 relative">
    <div class="h-16 bg-white/10 rounded w-3/4"></div>
    <div class="h-6 bg-white/10 rounded w-1/2"></div>
    <div class="h-4 bg-white/10 rounded w-2/3"></div>
    <div class="h-12 bg-white/10 rounded w-40"></div>
  </div>
);

// --- Background Component ---
const HeroBackground: Component<{
  backgroundImage?: string;
  backgroundPosition?: string;
  gradient: typeof defaultGradient;
  overlay: boolean;
}> = (props) => {
  const gradientClass = () => `bg-gradient-${props.gradient.direction} from-${props.gradient.from} ${props.gradient.via ? `via-${props.gradient.via}` : ''} to-${props.gradient.to}`;
  
  const backgroundStyle = () => {
    if (!props.backgroundImage) return {};
    return {
      'background-image': `url(${props.backgroundImage})`,
      'background-position': props.backgroundPosition || 'center',
      'background-size': 'cover',
      'background-repeat': 'no-repeat'
    };
  };

  return (
    <>
      {/* Background Image */}
      {props.backgroundImage && (
        <div 
          class="absolute inset-0"
          style={backgroundStyle()}
        />
      )}
      
      {/* Gradient Overlay */}
      <div class={`absolute inset-0 ${gradientClass()}`} />
      
      {/* Additional Dark Overlay */}
      {props.overlay && (
        <div class="absolute inset-0 bg-black/20" />
      )}
    </>
  );
};

// --- Default Actions Component ---
const DefaultActions: Component<{ onPlayClick?: () => void }> = (props) => (
  <div class="flex gap-4">
    <PlayButton 
      size="lg"
      variant="primary"
      label="Listen Now"
      onClick={props.onPlayClick}
    />
  </div>
);

// --- Main Component ---
export const HeroContent: Component<HeroContentProps> = (props) => {
  const height = () => props.height || 'lg';
  const contentPosition = () => props.contentPosition || 'end';
  const gradient = () => ({ ...defaultGradient, ...props.gradient });
  const overlay = () => props.overlay ?? false;

  const containerClass = () => [
    'relative w-full rounded-2xl overflow-hidden flex',
    heightStyles[height()],
    positionStyles[contentPosition()]
  ].join(' ');

  const contentClass = () => [
    'relative z-10 p-8',
    contentPosition() === 'center' ? 'text-center' : 'text-left',
    contentPosition() === 'end' ? 'self-end' : '',
    'max-w-2xl'
  ].join(' ');

  if (props.loading) {
    return (
      <div class={containerClass()}>
        <HeroBackground 
          backgroundImage={props.backgroundImage}
          backgroundPosition={props.backgroundPosition}
          gradient={gradient()}
          overlay={overlay()}
        />
        <div class={contentClass()}>
          <LoadingSkeleton />
        </div>
      </div>
    );
  }

  return (
    <div class={containerClass()}>
      <HeroBackground 
        backgroundImage={props.backgroundImage}
        backgroundPosition={props.backgroundPosition}
        gradient={gradient()}
        overlay={overlay()}
      />
      
      <div class={contentClass()}>
        <MediaInfo 
          title={props.title}
          subtitle={props.subtitle}
          description={props.description}
          metadata={props.metadata}
          titleLevel="hero"
          alignment={contentPosition() === 'center' ? 'center' : 'left'}
          maxWidth="100%"
        />
        
        {/* Actions */}
        <div class="mt-6">
          {props.actions || <DefaultActions onPlayClick={props.onPlayClick} />}
        </div>
      </div>
    </div>
  );
};
