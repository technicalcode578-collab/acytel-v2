// File: src/app/index.tsx
import { render } from 'solid-js/web';
import { Router } from '@solidjs/router';
import { initializeWasm } from '../shared/lib/wasm-loader';
import App from './ui/App';
import { AppRouter } from './providers/router';
import './styles/index.css';


const initApp = async () => {
  try {
    console.log('[App] Initializing WASM module...');
    await initializeWasm();
    console.log('[App] WASM module initialized successfully');
    
    const root = document.getElementById('root');
    if (!root) throw new Error('Root element not found');

    render(() => (
      <AppRouter />
    ), root);
    
    console.log('[App] Application initialized successfully');
  } catch (error) {
    console.error('[App] Failed to initialize application:', error);
    // Show fallback UI
    const root = document.getElementById('root');
    if (root) {
      root.innerHTML = `
        <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh; color: white; background: #1a1c25;">
          <h1>Failed to Initialize Audio Engine</h1>
          <p>Please refresh the page to try again.</p>
          <button onclick="window.location.reload()" style="margin-top: 20px; padding: 10px 20px; background: #3b82f6; color: white; border: none; border-radius: 8px; cursor: pointer;">Refresh</button>
        </div>
      `;
    }
  }
};

initApp();