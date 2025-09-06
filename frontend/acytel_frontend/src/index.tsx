// File: src/index.tsx
import { render } from 'solid-js/web';
import { Router, Route } from '@solidjs/router';
import { Component } from 'solid-js';

import './index.css';

// Core
import { initializeWasm } from './core/wasm-loader';

// Auth Feature - This path will be valid after the next step
import './features/auth/model/auth.store';

// Pages - These paths will be valid after the next steps
import { WelcomePage } from './pages/WelcomePage';
import { AuthPage } from './pages/AuthPage';
import MainApplicationPage from './pages/MainApplicationPage';

// Shared UI
import ProtectedRoute from './shared/ui/ProtectedRoute';

const root = document.getElementById('root');

if (import.meta.env.DEV && !(root instanceof HTMLElement)) {
  throw new Error(
    'Root element not found. Did you forget to add it to your index.html?',
  );
}

// This component now acts as the root for all authenticated routes.
const AuthenticatedRoutes: Component = () => (
    <ProtectedRoute>
        <MainApplicationPage />
    </ProtectedRoute>
);

initializeWasm().then(() => {
    console.log("[index.tsx] WASM module ready. Rendering application.");
    render(() => (
      <Router>
        <Route path="/welcome" component={WelcomePage} />
        <Route path="/login" component={AuthPage} />
        {/* All other paths are caught here and protected */}
        <Route path="/*" component={AuthenticatedRoutes} />
      </Router>
    ), root!);
}).catch(error => {
    console.error("[index.tsx] Critical error: Cannot start application.", error);
    root!.innerHTML = 'A critical error occurred while loading the application.';
});