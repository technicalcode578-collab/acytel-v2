///workspaces/acytel-v2/frontend/acytel_frontend/src/pages/HomePage.tsx
import { Component, createSignal, onMount } from 'solid-js';
import { HomeScreen } from '../widgets/HomeScreen/HomeScreen';

export const HomePage: Component = () => {
  const [pageLoading, setPageLoading] = createSignal(true);
  const [audioInitialized, setAudioInitialized] = createSignal(false);

  const initializeAudio = async () => {
    try {
      await new Promise(resolve => setTimeout(resolve, 300));
      setAudioInitialized(true);
      console.log('🎵 Audio service initialized');
    } catch (error) {
      console.warn('Audio initialization failed:', error);
      setAudioInitialized(false);
    }
  };

  const handleHeroPlay = () => {
    console.log('🎵 Playing hero content: Acytel');
  };

  const handleAlbumClick = (albumId: string | number) => {
    console.log(`📀 Navigating to album: ${albumId}`);
  };

  const handlePlayAlbum = (albumId: string | number) => {
    console.log(`🎵 Playing album: ${albumId}`);
  };

  onMount(async () => {
    await initializeAudio();
    setTimeout(() => {
      setPageLoading(false);
      console.log('🏠 HomePage fully loaded - Universe No. 1 achieved!');
    }, 100);
  });

  return (
    <div class="relative min-h-screen">
      {pageLoading() && (
        <div class="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center">
          <div class="flex flex-col items-center gap-4">
            <div class="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin"></div>
            <p class="text-sm text-secondary-text">Loading universe no. 1...</p>
          </div>
        </div>
      )}

      <HomeScreen 
        loading={pageLoading()}
        onPlayHero={handleHeroPlay}
        onAlbumClick={handleAlbumClick}
        onPlayAlbum={handlePlayAlbum}
      />

      

       
    </div>
  );
};