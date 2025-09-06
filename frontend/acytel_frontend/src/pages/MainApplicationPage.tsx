// File: src/pages/MainApplicationPage.tsx
import { Show, createEffect, Component } from 'solid-js';
import { Motion, Presence } from 'solid-motion';
import { useNavigate } from '@solidjs/router';

// Core & Shared UI
import { pageTransition } from '../core/motion';
import Layout from '../shared/ui/Layout'; // Note: Layout.tsx will be moved later

// Feature: Auth
import authState, { logout } from '../features/auth/model/auth.store';

// Feature: Library
import { UploadForm } from '../features/library/ui/UploadForm';
import { TrackList } from '../features/library/ui/TrackList';
import { getTracks } from '../features/library/api/track.service';
import { libraryStore } from '../features/library/model/library.store';

// Feature: Search
import { SearchBar } from '../features/search/ui/SearchBar';
import { SearchResults } from '../features/search/ui/SearchResults';
import searchState from '../features/search/model/search.store';

// Feature: Playlist
import { PlaylistView } from '../features/playlist/ui/PlaylistView';
import { getPlaylists } from '../features/playlist/api/playlist.service';
import { playlistStore } from '../features/playlist/model/playlist.store';

const MainLibraryView: Component = () => (
  <>
    <UploadForm />
    <SearchBar />
    <Show
      when={searchState.query.trim() !== ""}
      fallback={<TrackList />}
    >
      <SearchResults />
    </Show>
  </>
);

const MainApplicationPage: Component = () => {
  const navigate = useNavigate();

  createEffect(() => {
    // This effect correctly fetches initial data when the component mounts
    // for an authenticated user.
    if (authState.isAuthenticated) {
      getTracks()
        .then(tracks => libraryStore.setTracks(tracks))
        .catch(err => console.error("Failed to fetch library", err));
      getPlaylists()
        .then(playlists => playlistStore.setPlaylists(playlists))
        .catch(err => console.error("Failed to fetch playlists", err));
    }
  });

  const handleLogout = () => {
    logout();
    navigate('/welcome', { replace: true });
  };

  return (
    <Layout>
      <header class="flex justify-between items-center mb-8">
        <h1 class="text-3xl font-extrabold">Acytel</h1>
        <button
          onClick={handleLogout}
          class="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
        >
          Logout
        </button>
      </header>
      <main class="relative">
        <Presence exitBeforeEnter>
          <Show
            when={playlistStore.activePlaylist()}
            fallback={
              <Motion
                component="div"
                key="library"
                initial={pageTransition.hidden}
                animate={pageTransition.visible}
                exit={pageTransition.exit}
                class="absolute w-full"
              >
                <MainLibraryView />
              </Motion>
            }
          >
            <Motion
              component="div"
              key="playlist"
              initial={pageTransition.hidden}
              animate={pageTransition.visible}
              exit={pageTransition.exit}
              class="absolute w-full"
            >
              <PlaylistView />
            </Motion>
          </Show>
        </Presence>
      </main>
    </Layout>
  );
};

export default MainApplicationPage;