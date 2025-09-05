import { render } from 'solid-js/web';
// ...existing code...
import authState from './store/auth.store';
import { useNavigate } from '@solidjs/router';
import { Router, Route } from '@solidjs/router';
import { WelcomeScreen } from './components/auth/WelcomeScreen';
import AuthForms from './components/auth/AuthForms';
import App from './App';
import './index.css';
import { initializeWasm } from './core/wasm-loader';

const root = document.getElementById('root');

if (import.meta.env.DEV && !(root instanceof HTMLElement)) {
  throw new Error(
    'Root element not found. Did you forget to add it to your index.html? Or maybe the id attribute got misspelled?',
  );
}

initializeWasm().then(() => {
    console.log("[index.tsx] WASM module ready. Rendering application.");
    render(() => (
      <Router>
        <Route path="/welcome" component={() => <WelcomeScreen />} />
  <Route path="/login" component={AuthForms} />
  <Route path="/register" component={AuthForms} />
        <Route path="/" component={() => {
          if (window.location.pathname === '/' && !authState.isAuthenticated) {
            window.location.replace('/welcome');
            return null;
          }
          return <App />;
        }} />
      </Router>
    ), root!);
}).catch(error => {
    console.error("[index.tsx] Critical error: Cannot start application.", error);
    root!.innerHTML = 'A critical error occurred while loading the application.';
});