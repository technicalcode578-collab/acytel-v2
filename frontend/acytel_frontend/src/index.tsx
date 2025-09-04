import { render } from 'solid-js/web';
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
    render(() => <App />, root!);
}).catch(error => {
    console.error("[index.tsx] Critical error: Cannot start application.", error);
    root!.innerHTML = 'A critical error occurred while loading the application.';
});