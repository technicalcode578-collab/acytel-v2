// frontend/acytel_frontend/src/App.tsx

import { Show, createEffect } from 'solid-js';
import { Motion, Presence } from 'solid-motion';
import { useNavigate } from '@solidjs/router';
import { pageTransition } from './core/motion';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';

// Auth imports
import authState, { logout } from './store/auth.store';

// Library imports
import { UploadForm } from './components/library/UploadForm';
import { TrackList } from './components/library/TrackList';
import { getTracks } from './services/track.service';
import { libraryStore } from './store/library.store';

// Search imports
import { SearchBar } from './components/search/SearchBar';
import { SearchResults } from './components/search/SearchResults';
import searchState, { searchActions } from './store/search.store';

// Playlist imports
import { PlaylistView } from './components/playlist/PlaylistView';
import { getPlaylists } from './services/playlist.service';
import { playlistStore } from './store/playlist.store';

function App() {
  const navigate = useNavigate();

  createEffect(() => {
    // This effect now correctly runs only when the authenticated app is mounted
    if (authState.isAuthenticated) {
      getTracks()
        .then(tracks => libraryStore.setTracks(tracks))
        .catch(err => console.error("Failed to fetch library", err));
      getPlaylists()
        .then(playlists => playlistStore.setPlaylists(playlists))
        .catch(err => console.error("Failed to fetch playlists", err));
    }
  });

  const MainLibraryView = () => (
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

  return (
    <ProtectedRoute>
      <Layout>
        <header class="flex justify-between items-center mb-8">
          <h1 class="text-3xl font-extrabold">Acytel</h1>
          <button
            onClick={() => {
              logout();
              navigate('/welcome'); // Use router navigation for a seamless SPA experience
            }}
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
    </ProtectedRoute>
  );
}

export default App;