// frontend/acytel_frontend/src/index.tsx
import { render } from 'solid-js/web';
import { Router, Route, Navigate } from '@solidjs/router';
import { Show, Component } from 'solid-js';

import authState from './store/auth.store';
import { WelcomeScreen } from './components/welcome/WelcomeScreen'; // <-- PATH UPDATED
import { AuthPage } from './components/auth/AuthPage';
import App from './App';
import './index.css';
import { initializeWasm } from './core/wasm-loader';

const root = document.getElementById('root');

if (import.meta.env.DEV && !(root instanceof HTMLElement)) {
  throw new Error(
    'Root element not found. Did you forget to add it to your index.html? Or maybe the id attribute got misspelled?',
  );
}

const RootRoute: Component = () => (
  <Show when={authState.isAuthenticated} fallback={<Navigate href="/welcome" />}>
    <App />
  </Show>
);

initializeWasm().then(() => {
    console.log("[index.tsx] WASM module ready. Rendering application.");
    render(() => (
      <Router>
        <Route path="/welcome" component={WelcomeScreen} />
        <Route path="/login" component={AuthPage} />
        <Route path="/*" component={RootRoute} />
      </Router>
    ), root!);
}).catch(error => {
    console.error("[index.tsx] Critical error: Cannot start application.", error);
    root!.innerHTML = 'A critical error occurred while loading the application.';
});