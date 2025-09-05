import { render } from 'solid-js/web';
import App from './App';
import authState from './store/auth.store';
import { useNavigate } from '@solidjs/router';
import { Router, Route } from '@solidjs/router';
import { WelcomeScreen } from './components/auth/WelcomeScreen';
import { LoginForm } from './components/auth/LoginForm';
import { RegisterForm } from './components/auth/RegisterForm';
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
        <Route path="/login" component={() => (
          <div class="flex items-center justify-center h-screen bg-gray-900">
            <div class="w-full max-w-md p-8 space-y-8 bg-gray-800 rounded-lg shadow-lg">
              <h2 class="text-center text-3xl font-extrabold">Sign in to Acytel</h2>
              <div class="mt-8">
                <LoginForm />
              </div>
            </div>
          </div>
        )} />
        <Route path="/register" component={() => (
          <div class="flex items-center justify-center h-screen bg-gray-900">
            <div class="w-full max-w-md p-8 space-y-8 bg-gray-800 rounded-lg shadow-lg">
              <h2 class="text-center text-3xl font-extrabold">Create your Account</h2>
              <div class="mt-8">
                <RegisterForm onRegisterSuccess={() => {}} />
              </div>
            </div>
          </div>
        )} />
        <Route path="/" component={() => {
          if (!authState.isAuthenticated) {
            const navigate = useNavigate();
            navigate('/welcome');
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