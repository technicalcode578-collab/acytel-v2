// File: src/shared/ui/molecules/Content/MediaInfo.tsx
import { Component } from 'solid-js';
import { Heading } from '../../atoms/Typography/Heading';

// --- Component Props Interface ---
interface MediaInfoProps {
  title: string;
  subtitle?: string;
  description?: string;
  metadata?: string | string[];
  layout?: 'vertical' | 'horizontal';
  alignment?: 'left' | 'center' | 'right';
  titleLevel?: 'hero' | 'display' | 'h1' | 'h2' | 'h3' | 'h4';
  maxWidth?: string;
  truncate?: {
    title?: boolean;
    subtitle?: boolean;
    description?: boolean;
  };
  loading?: boolean;
}

// --- Loading Skeleton ---
const LoadingSkeleton: Component = () => (
  <div class="animate-pulse space-y-2">
    <div class="h-8 bg-muted/20 rounded w-3/4"></div>
    <div class="h-4 bg-muted/20 rounded w-1/2"></div>
    <div class="h-3 bg-muted/20 rounded w-2/3"></div>
  </div>
);

// --- Metadata Component ---
const Metadata: Component<{ metadata: string | string[] }> = (props) => {
  const metadataArray = () => Array.isArray(props.metadata) ? props.metadata : [props.metadata];
  
  return (
    <div class="flex flex-wrap gap-1 text-xs text-muted">
      {metadataArray().map((item, index) => (
        <>
          <span>{item}</span>
          {index < metadataArray().length - 1 && (
            <span class="text-muted/50">•</span>
          )}
        </>
      ))}
    </div>
  );
};

// --- Description Component ---
const Description: Component<{ 
  description: string; 
  maxWidth?: string; 
  truncate?: boolean;
  alignment: 'left' | 'center' | 'right';
}> = (props) => {
  const alignmentClass = () => {
    switch (props.alignment) {
      case 'center': return 'text-center';
      case 'right': return 'text-right';
      default: return 'text-left';
    }
  };

  const truncateClass = () => props.truncate ? 'line-clamp-3' : '';
  
  const maxWidthStyle = () => props.maxWidth ? { 'max-width': props.maxWidth } : {};

  return (
    <p 
      class={`text-sm text-secondary-text leading-relaxed ${alignmentClass()} ${truncateClass()}`}
      style={maxWidthStyle()}
    >
      {props.description}
    </p>
  );
};

// --- Main Component ---
export const MediaInfo: Component<MediaInfoProps> = (props) => {
  const layout = () => props.layout || 'vertical';
  const alignment = () => props.alignment || 'left';
  const titleLevel = () => props.titleLevel || 'h2';
  const truncate = () => props.truncate || {};

  const alignmentClass = () => {
    switch (alignment()) {
      case 'center': return 'text-center items-center';
      case 'right': return 'text-right items-end';
      default: return 'text-left items-start';
    }
  };

  const containerClass = () => {
    const base = `flex ${alignmentClass()}`;
    return layout() === 'horizontal' ? `${base} flex-row gap-6` : `${base} flex-col gap-2`;
  };

  const maxWidthStyle = () => props.maxWidth ? { 'max-width': props.maxWidth } : {};

  if (props.loading) {
    return <LoadingSkeleton />;
  }

  return (
    <div class={containerClass()} style={maxWidthStyle()}>
      {/* Primary Content Group */}
      <div class={`flex flex-col gap-2 ${layout() === 'horizontal' ? 'flex-grow' : ''}`}>
        {/* Title */}
        <Heading 
          level={titleLevel()}
          color="primary"
          align={alignment()}
          truncate={truncate().title}
        >
          {props.title}
        </Heading>

        {/* Subtitle */}
        {props.subtitle && (
          <Heading 
            level="h4"
            color="secondary" 
            weight="medium"
            align={alignment()}
            truncate={truncate().subtitle}
          >
            {props.subtitle}
          </Heading>
        )}

        {/* Metadata */}
        {props.metadata && (
          <div class={alignment() === 'center' ? 'flex justify-center' : alignment() === 'right' ? 'flex justify-end' : 'flex justify-start'}>
            <Metadata metadata={props.metadata} />
          </div>
        )}
      </div>

      {/* Description */}
      {props.description && (
        <Description 
          description={props.description}
          maxWidth={props.maxWidth}
          truncate={truncate().description}
          alignment={alignment()}
        />
      )}
    </div>
  );
};
