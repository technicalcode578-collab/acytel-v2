// File: src/shared/ui/Layout.tsx (Definitive)
import { JSX } from 'solid-js';
import { PlaylistSidebar } from '../../widgets/playlist-sidebar/PlaylistSidebar';
import { NowPlayingSidebar } from '../../widgets/player/NowPlayingSidebar';
import styles from './Layout.module.css';

export default function Layout(props: { children: JSX.Element }) {
  return (
    // CRITICAL: This class applies the grid, gaps, and padding.
    <div class={styles.appContainer}>
      <aside class={styles.leftSidebar}>
        <PlaylistSidebar /> 
      </aside>
      <main class={styles.mainView}>
        {props.children}
      </main>
      <aside class={styles.rightSidebar}>
        <NowPlayingSidebar />
      </aside>
    </div>
  );
}