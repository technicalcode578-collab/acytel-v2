// frontend/acytel_frontend/src/components/auth/AuthPage.tsx

import { createSignal, onMount, onCleanup, Component, Show } from 'solid-js';
import { Motion } from 'solid-motion';
import { startParticleAnimation } from '../../core/particles';
// Corrected the import path to point to the new 'welcome' directory
import styles from '../welcome/WelcomeScreen.module.css'; 
import { LoginForm } from './LoginForm';
import { RegisterForm } from './RegisterForm';

export const AuthPage: Component = () => {
  let canvasRef: HTMLCanvasElement | undefined;
  const [view, setView] = createSignal<'login' | 'register'>('login');

  onMount(() => {
    if (canvasRef) {
      const cleanup = startParticleAnimation(canvasRef);
      if (cleanup) {
        onCleanup(cleanup);
      }
    }
  });

  return (
    <div class={styles.container}>
      <canvas ref={canvasRef} class={styles.canvas} />
      <Motion
        component="div"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        class="relative z-10 w-full"
      >
        <Show when={view() === 'login'} fallback={
          <RegisterForm onSwitchToLogin={() => setView('login')} />
        }>
          <LoginForm onSwitchToRegister={() => setView('register')} />
        </Show>
      </Motion>
    </div>
  );
};