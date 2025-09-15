import { Component } from "solid-js";

interface LoadingSkeletonProps {
  width?: string;
  height?: string;
  rounded?: boolean;
  className?: string;
}

export const LoadingSkeleton: Component<LoadingSkeletonProps> = (props) => {
  return (
    <div
      class={`animate-pulse bg-gray-700 ${props.rounded ? 'rounded-full' : 'rounded'} ${props.className || ''}`}
      style={{
        width: props.width || '100%',
        height: props.height || '1rem',
      }}
    />
  );
};