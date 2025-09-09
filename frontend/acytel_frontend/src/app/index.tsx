import { render } from 'solid-js/web';
import './styles/index.css';
import { initializeWasm } from '../shared/lib/wasm-loader';
import App from './ui/App';

const root = document.getElementById('root');

if (import.meta.env.DEV && !(root instanceof HTMLElement)) {
  throw new Error('Root element not found.');
}

initializeWasm().then(() => {
    console.log("[index.tsx] WASM module ready. Rendering application.");
    render(() => <App />, root!);
}).catch(error => {
    console.error("[index.tsx] Critical error: Cannot start application.", error);
    root!.innerHTML = 'A critical error occurred while loading the application.';
});