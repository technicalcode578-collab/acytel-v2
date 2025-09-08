// File: src/app/ui/App.tsx (Corrected)
import type { Component } from 'solid-js';
import { AppRouter } from '../providers/router';

// The root App component should NOT contain any styling or layout wrappers.
// Its only job is to render the router.
const App: Component = () => {
  return (
    <AppRouter />
  );
};

export default App;