// File: src/shared/ui/atoms/Layout/Card.tsx
import { Component, JSX } from 'solid-js';

// --- Component Props Interface ---
interface CardProps {
  variant?: 'default' | 'elevated' | 'outlined' | 'ghost';
  padding?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
  radius?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
  hoverable?: boolean;
  clickable?: boolean;
  loading?: boolean;
  children: JSX.Element;
  onClick?: () => void;
  class?: string;
}

// --- Style Configurations ---
const variantStyles = {
  default: 'bg-surface/50 border border-surface',
  elevated: 'bg-surface shadow-lg border border-surface/50',
  outlined: 'bg-transparent border border-muted/20',
  ghost: 'bg-transparent border border-transparent'
};

const paddingStyles = {
  none: 'p-0',
  sm: 'p-2',
  md: 'p-4', 
  lg: 'p-6',
  xl: 'p-8'
};

const radiusStyles = {
  none: 'rounded-none',
  sm: 'rounded-sm',
  md: 'rounded-lg',
  lg: 'rounded-xl',
  xl: 'rounded-2xl'
};

const interactionStyles = {
  hoverable: 'hover:bg-surface transition-colors duration-200',
  clickable: 'cursor-pointer hover:scale-[1.02] active:scale-[0.98] transition-transform duration-200',
  both: 'cursor-pointer hover:bg-surface hover:scale-[1.02] active:scale-[0.98] transition-all duration-200'
};

// --- Loading Skeleton ---
const LoadingSkeleton: Component = () => (
  <div class="animate-pulse">
    <div class="h-4 bg-muted/20 rounded mb-2"></div>
    <div class="h-3 bg-muted/20 rounded w-3/4 mb-2"></div>
    <div class="h-3 bg-muted/20 rounded w-1/2"></div>
  </div>
);

// --- Main Component ---
export const Card: Component<CardProps> = (props) => {
  const variant = () => props.variant || 'default';
  const padding = () => props.padding || 'md';
  const radius = () => props.radius || 'md';
  
  const getInteractionStyle = () => {
    if (props.hoverable && props.clickable) return interactionStyles.both;
    if (props.clickable) return interactionStyles.clickable;
    if (props.hoverable) return interactionStyles.hoverable;
    return '';
  };
  
  const baseClasses = 'relative overflow-hidden';
  
  const classes = () => [
    baseClasses,
    variantStyles[variant()],
    paddingStyles[padding()],
    radiusStyles[radius()],
    getInteractionStyle(),
    props.class || ''
  ].filter(Boolean).join(' ');

  const handleClick = () => {
    if (props.onClick && props.clickable && !props.loading) {
      props.onClick();
    }
  };

  return (
    <div 
      class={classes()}
      onClick={handleClick}
      role={props.clickable ? 'button' : undefined}
      tabindex={props.clickable ? 0 : undefined}
      onKeyPress={(e) => {
        if (props.clickable && (e.key === 'Enter' || e.key === ' ')) {
          handleClick();
        }
      }}
    >
      {/* Loading overlay */}
      {props.loading && (
        <div class="absolute inset-0 bg-surface/80 backdrop-blur-sm flex items-center justify-center z-10">
          <div class="animate-spin text-accent">⏳</div>
        </div>
      )}
      
      {/* Content */}
      {props.loading ? <LoadingSkeleton /> : props.children}
    </div>
  );
};