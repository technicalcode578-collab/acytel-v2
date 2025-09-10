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

      <div class="fixed bottom-20 right-4 z-40">
        <div class={`
          px-3 py-1 rounded-full text-xs transition-all duration-300
          ${audioInitialized() 
            ? 'bg-accent/20 text-accent border border-accent/30' 
            : 'bg-muted/20 text-muted border border-muted/30'
          }
        `}>
          {audioInitialized() ? '🎵 Audio Ready' : '🔇 Audio Loading'}
        </div>
      </div>

      <div class="fixed bottom-4 left-4 text-xs text-muted/50 z-40 select-none">
        Universe No. 1 • Sona Forge Master
      </div>
    </div>
  );
};
