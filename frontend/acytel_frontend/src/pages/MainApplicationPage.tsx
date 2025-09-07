// File: src/pages/MainApplicationPage.tsx
import { Show, createEffect, Component } from 'solid-js';
import { Motion, Presence } from 'solid-motion';
import { useNavigate } from '@solidjs/router';
import { pageTransition } from '../shared/lib/motion';
import authState, { logout } from '../features/auth/model/auth.store';
import { UploadForm } from '../features/library/ui/UploadForm';
import { TrackList } from '../features/library/ui/TrackList';
import { getTracks } from '../entities/track/api/track.api';
import { libraryStore } from '../entities/track/model/track.store';
import { SearchBar } from '../features/search/ui/SearchBar';
import { SearchResults } from '../features/search/ui/SearchResults';
import searchState from '../features/search/model/search.store';
import { PlaylistView } from '../features/playlist/ui/PlaylistView';
import { getPlaylists } from '../features/playlist/api/playlist.service';
import { playlistStore } from '../features/playlist/model/playlist.store';
import Layout from '../shared/ui/Layout';

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
        if (authState.isAuthenticated) {
            getTracks()
                .then((tracks: any) => libraryStore.setTracks(tracks))
                .catch((err: any) => console.error("Failed to fetch library", err));
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
            <main class="relative h-[calc(100vh-150px)]">
                <Presence exitBeforeEnter>
                    <Show
                        when={playlistStore.activePlaylist()}
                        fallback={
                            <Motion
                                component="div" // CORRECTED
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
                            component="div" // CORRECTED
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