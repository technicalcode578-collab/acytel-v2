// File: src/shared/ui/atoms/Button/PlayButton.tsx
import { Component } from 'solid-js';

// --- Enhanced Play Icon (Forged from Blueprint) ---
const PlayIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="1.5"/>
    <path d="M10 8L15 12L10 16V8Z" fill="currentColor"/>
  </svg>
);

// --- Component Props Interface ---
interface PlayButtonProps {
  size?: 'sm' | 'md' | 'lg';
  variant?: 'primary' | 'secondary' | 'ghost';
  label?: string;
  onClick?: () => void;
  disabled?: boolean;
  loading?: boolean;
}

// --- Size and Variant Configurations ---
const sizeStyles = {
  sm: 'px-3 py-1.5 text-sm gap-2',
  md: 'px-6 py-2 text-base gap-3',
  lg: 'px-8 py-3 text-lg gap-4'
};

const variantStyles = {
  primary: 'bg-white/10 hover:bg-white/20 text-primary-text border border-white/20',
  secondary: 'bg-accent hover:bg-accent/80 text-primary-text border border-accent',
  ghost: 'bg-transparent hover:bg-white/10 text-primary-text border border-transparent'
};

// --- Main Component ---
export const PlayButton: Component<PlayButtonProps> = (props) => {
  const size = () => props.size || 'md';
  const variant = () => props.variant || 'primary';
  const label = () => props.label || 'Listen Now';

  const baseClasses = 'flex items-center justify-center rounded-full font-semibold transition-all duration-300 transform hover:scale-105 active:scale-95 focus:outline-none focus:ring-2 focus:ring-accent/50 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100';
  
  const classes = () => `${baseClasses} ${sizeStyles[size()]} ${variantStyles[variant()]}`;

  const handleClick = () => {
    if (!props.disabled && !props.loading && props.onClick) {
      props.onClick();
    }
  };

  return (
    <button 
      class={classes()}
      onClick={handleClick}
      disabled={props.disabled || props.loading}
      aria-label={`${label()} button`}
    >
      {props.loading ? (
        <>
          <span class="animate-spin">⏳</span>
          {label()}
        </>
      ) : (
        <>
          {label()}
          <PlayIcon />
        </>
      )}
    </button>
  );
};