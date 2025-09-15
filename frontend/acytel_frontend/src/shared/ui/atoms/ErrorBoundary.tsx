import { Component, JSX, onError, createSignal } from "solid-js";

interface ErrorBoundaryProps {
  fallback?: (error: Error) => JSX.Element;
  children: JSX.Element;
}

export const ErrorBoundary: Component<ErrorBoundaryProps> = (props) => {
  const [error, setError] = createSignal<Error | null>(null);

  onError((err) => {
    console.error('Error caught by boundary:', err);
    setError(err as Error);
  });

  return error() ? (
    props.fallback ? props.fallback(error()!) : (
      <div class="p-4 bg-red-900 text-red-100 rounded-lg">
        <h3 class="font-semibold">Something went wrong</h3>
        <p class="text-sm opacity-90 mt-1">{error()!.message}</p>
        <button
          onClick={() => setError(null)}
          class="mt-2 text-sm underline hover:no-underline"
        >
          Try again
        </button>
      </div>
    )
  ) : (
    props.children
  );
};