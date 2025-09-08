// File: src/widgets/player/NowPlayingSidebar.tsx
import { Component } from 'solid-js';
import styles from './NowPlayingSidebar.module.css';

export const NowPlayingSidebar: Component = () => {
  return (
    <div class={styles.sidebarWrapper}>
      <img src="https://placehold.co/300x300/a855f7/white?text=S" class={styles.albumArt} alt="Current Song" />
      
      <div class={styles.trackInfo}>
        <h3 class={styles.trackTitle}>Blinding Lights</h3>
        <p class={styles.trackArtist}>The Weeknd</p>
      </div>
      
      <div class={styles.playbackControls}>
        <div class={styles.mainControls}>
          <button class={styles.controlButton}>⏮️</button>
          <button class={styles.playButton}>▶️</button>
          <button class={styles.controlButton}>⏭️</button>
        </div>
        {/* Progress bar placeholder */}
        <div style={{ width: '100%', height: '4px', background: 'var(--decorative-subdued)', 'border-radius': '2px' }}>
          <div style={{ width: '40%', height: '100%', background: 'var(--text-base)', 'border-radius': '2px' }}></div>
        </div>
      </div>

      <div>
        <h4 class={styles.trackTitle} style={{ 'font-size': '1rem', 'margin-bottom': '1rem' }}>Friend Activity</h4>
        {/* Friend activity placeholder */}
        <p class={styles.trackArtist}>Coming soon...</p>
      </div>
    </div>
  );
};