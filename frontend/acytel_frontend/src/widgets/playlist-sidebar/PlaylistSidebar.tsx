// File: src/widgets/playlist-sidebar/PlaylistSidebar.tsx (Definitive)
import { Component, For } from "solid-js";
import styles from './PlaylistSidebar.module.css';

const playlists = [ /* ... mock data remains the same ... */ { id: 1, name: 'Liked Songs', meta: 'Playlist • 345 songs', color: '7e22ce', initial: 'L' }, { id: 2, name: 'Daily Mix 1', meta: 'Playlist • Post Malone...', color: '1d4ed8', initial: 'DP' }, { id: 3, name: 'Chill Hits', meta: 'Artist • Various Artists', color: 'be123c', initial: 'CH' }, { id: 4, name: 'Rap Workout', meta: 'Playlist • Eminem, Drake...', color: '15803d', initial: 'RW' }, { id: 5, name: 'Lofi Productive', meta: 'Playlist • Beats to relax/study to', color: 'b45309', initial: 'LP' }];
const PlaylistItem = (props: typeof playlists[0]) => ( <div class={styles.playlistItem}> <img src={`https://placehold.co/48x48/${props.color}/white?text=${props.initial}`} alt={props.name} class={styles.playlistImage} /> <div class={styles.playlistInfo}> <span class={styles.playlistTitle}>{props.name}</span> <span class={styles.playlistMeta}>{props.meta}</span> </div> </div> );

export const PlaylistSidebar: Component = () => {
  return (
    // CRITICAL: This wrapper creates the gap between the two panels below.
    <div class={styles.sidebarWrapper}>
      {/* CRITICAL: This is the first glass panel. */}
      <div class={`${styles.navSection} ${styles.glassPanel}`}>
        <a href="#" class={`${styles.navItem} ${styles.active}`}>
          <span class="w-6 h-6">🏠</span> Home
        </a>
        <a href="#" class={`${styles.navItem} ${styles.inactive}`}>
          <span class="w-6 h-6">🔍</span> Search
        </a>
      </div>
      {/* CRITICAL: This is the second glass panel. */}
      <div class={`${styles.librarySection} ${styles.glassPanel}`}>
        <div class={styles.libraryHeader}>
          <a href="#" class={`${styles.navItem} ${styles.inactive}`}>
            <span class="w-6 h-6">📚</span> Your Library
          </a>
        </div>
        <div class={styles.playlistContainer}>
          <For each={playlists}>
            {(playlist) => <PlaylistItem {...playlist} />}
          </For>
        </div>
      </div>
    </div>
  );
};