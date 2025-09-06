// File: src/pages/WelcomePage.tsx
import { createSignal, onMount, onCleanup, Component } from 'solid-js';
import { useNavigate } from '@solidjs/router';
import { startParticleAnimation } from '../core/particles';
import styles from './WelcomePage.module.css';

export const WelcomePage: Component = () => {
  const navigate = useNavigate();
  let canvasRef: HTMLCanvasElement | undefined;
  const [showContent, setShowContent] = createSignal(false);
  const [showArrow, setShowArrow] = createSignal(false);

  onMount(() => {
    if (canvasRef) {
      const cleanup = startParticleAnimation(canvasRef);
      if (cleanup) {
        onCleanup(cleanup);
      }
    }
    setTimeout(() => setShowContent(true), 500);
    setTimeout(() => setShowArrow(true), 2500);
  });

  return (
    <div class={styles.container}>
      <canvas ref={canvasRef} class={styles.canvas} />
      <div class={`${styles.content} ${showContent() ? styles.visible : ''}`}>
        <div class={`${styles.logo} ${styles.fadeIn}`}>ACYTEL</div>
        <h1 class={`${styles.tagline} ${styles.fadeInDelay1}`}>
          Sound.<br/>Made Sentient.
        </h1>
        <div class={`${styles.line} ${styles.fadeInDelay2}`} />
        <div class={`${styles.enterContainer} ${showArrow() ? styles.visible : ''}`}>
          <button onClick={() => navigate('/login')} class={styles.enterButton}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M5 12H19" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M12 5L19 12L12 19" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </button>
        </div>
        <footer class={`${styles.footer} ${styles.fadeInDelay3}`}>
          Made by Harsh Rawal - © 2025 Acytel
        </footer>
      </div>
    </div>
  );
};