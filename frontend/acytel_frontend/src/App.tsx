import { Show, createEffect, createSignal } from 'solid-js';
import { Motion, Presence } from 'solid-motion';
import { pageTransition } from './core/motion';

// Auth imports
import authState, { logout } from './store/auth.store';
import { LoginForm } from './components/auth/LoginForm';
import { RegisterForm } from './components/auth/RegisterForm';

// Library imports
import { UploadForm } from './components/library/UploadForm';
import { TrackList } from './components/library/TrackList';
import { getTracks } from './services/track.service';
import { libraryStore } from './store/library.store';

// Player import
import { Player } from './components/player/Player';

// Search imports
import { SearchBar } from './components/search/SearchBar';
import { SearchResults } from './components/search/SearchResults';
import searchState, { searchActions } from './store/search.store';

// Playlist imports
import { PlaylistSidebar } from './components/playlist/PlaylistSidebar';
import { PlaylistView } from './components/playlist/PlaylistView';
import { getPlaylists } from './services/playlist.service';
import { playlistStore } from './store/playlist.store';

function App() {
  const [showLogin, setShowLogin] = createSignal(true);

  createEffect(() => {
    if (authState.isAuthenticated) {
      getTracks()
        .then(tracks => libraryStore.setTracks(tracks))
        .catch(err => console.error("Failed to fetch library", err));
      getPlaylists()
        .then(playlists => playlistStore.setPlaylists(playlists))
        .catch(err => console.error("Failed to fetch playlists", err));
    } else {
      libraryStore.setTracks([]);
      playlistStore.setPlaylists([]);
      searchActions.clearSearch();
      playlistStore.clearActivePlaylist();
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
    <div class="bg-gray-900 text-white min-h-screen">
      <Show
        when={authState.isAuthenticated}
        fallback={
          <div class="flex items-center justify-center h-screen">
            <div class="w-full max-w-md p-8 space-y-8 bg-gray-800 rounded-lg shadow-lg">
              <h2 class="text-center text-3xl font-extrabold">
                {showLogin() ? 'Sign in to Acytel' : 'Create your Account'}
              </h2>
              <div class="mt-8">
                <Show when={showLogin()} fallback={<RegisterForm onRegisterSuccess={() => setShowLogin(true)} />}>
                  <LoginForm />
                </Show>
              </div>
              <p class="mt-6 text-center text-sm">
                {showLogin() ? "Don't have an account? " : "Already have an account? "}
                <button onClick={() => setShowLogin(!showLogin())} class="font-medium text-blue-400 hover:text-blue-300">
                  {showLogin() ? 'Register' : 'Sign in'}
                </button>
              </p>
            </div>
          </div>
        }
      >
        <div class="flex h-screen">
          <PlaylistSidebar />
          <div class="flex-1 flex flex-col overflow-hidden">
            <div class="flex-1 overflow-y-auto pb-20">
              <div class="container mx-auto p-4 md:p-8">
                <header class="flex justify-between items-center mb-8">
                  <h1 class="text-3xl font-extrabold">Acytel</h1>
                  <button
                    onClick={logout}
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
              </div>
            </div>
          </div>
        </div>
        <Player />
      </Show>
    </div>
  );
}

export default App;