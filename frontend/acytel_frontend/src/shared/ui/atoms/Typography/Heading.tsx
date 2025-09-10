import { Component, JSX, createMemo } from 'solid-js';
import { Dynamic } from 'solid-js/web';

export interface HeadingProps {
  level?: 'hero' | 'display' | 'h1' | 'h2' | 'h3' | 'h4';
  color?: 'primary' | 'secondary' | 'muted' | 'accent';
  weight?: 'normal' | 'medium' | 'semibold' | 'bold';
  align?: 'left' | 'center' | 'right';
  truncate?: boolean;
  children: JSX.Element | string;
  class?: string;
}

const levelStyles = {
  hero: 'text-7xl leading-tight',
  display: 'text-5xl leading-tight',
  h1: 'text-4xl leading-tight',
  h2: 'text-2xl leading-snug',
  h3: 'text-xl leading-snug',
  h4: 'text-lg leading-normal'
};

const colorStyles = {
  primary: 'text-primary-text',
  secondary: 'text-secondary-text',
  muted: 'text-muted',
  accent: 'text-accent'
};

const weightStyles = {
  normal: 'font-normal',
  medium: 'font-medium',
  semibold: 'font-semibold',
  bold: 'font-bold'
};

const alignStyles = {
  left: 'text-left',
  center: 'text-center',
  right: 'text-right'
};

export const Heading: Component<HeadingProps> = (props) => {
  // Determine the actual HTML tag to use
  const tagName = createMemo(() => {
    const level = props.level || 'h2';
    return level === 'hero' || level === 'display' ? 'h1' : level;
  });

  // Compute classes based on props
  const classes = createMemo(() => {
    const level = props.level || 'h2';
    const color = props.color || 'primary';
    const weight = props.weight || 'bold';
    const align = props.align || 'left';
    
    const baseClasses = 'font-sans tracking-tight';
    const truncateClass = props.truncate ? 'truncate' : '';
    
    return [
      baseClasses,
      levelStyles[level],
      colorStyles[color],
      weightStyles[weight],
      alignStyles[align],
      truncateClass,
      props.class || ''
    ].filter(Boolean).join(' ');
  });

  // Use Dynamic component for runtime tag selection
  return (
    <Dynamic component={tagName()} class={classes()}>
      {props.children}
    </Dynamic>
  );
};
