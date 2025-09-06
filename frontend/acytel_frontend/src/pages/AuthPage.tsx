// File: src/pages/AuthPage.tsx
import { createSignal, onMount, onCleanup, Component, Show } from 'solid-js';
import { Motion } from 'solid-motion';
import { startParticleAnimation } from '../core/particles';
import styles from './WelcomePage.module.css'; // Re-uses the welcome page styles
import { LoginForm } from '../features/auth/ui/LoginForm';
import { RegisterForm } from '../features/auth/ui/RegisterForm';

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