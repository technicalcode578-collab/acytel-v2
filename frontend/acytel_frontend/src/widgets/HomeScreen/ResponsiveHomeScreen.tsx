// File: src/widgets/HomeScreen/ResponsiveHomeScreen.tsx
import { Component, createSignal, onMount, Show } from 'solid-js';
import { HeroSection } from './HeroSection/ResponsiveHeroSection';
import { AlbumsSection } from './ContentSections/ResponsiveAlbumsSection';

interface HomeScreenProps {
  loading?: boolean;
  onPlayHero?: () => void;
  onAlbumClick?: (albumId: string | number) => void;
  onPlayAlbum?: (albumId: string | number) => void;
}

const HERO_DATA = {
  title: 'Acytel',
  subtitle: 'Hindi',
  description: 'Toene: a s"euth sunt a stto years, teupa de enon menm acoef en nnt* afmenalen onreenan O. Epio am loopelansivu poc Abce. bneket onco e.',
  backgroundImage: '/assets/album_header_bg.png',
  backgroundPosition: 'center'
};

const ALBUMS_DATA = [
  { id: 1, title: 'Jea Lak Up', artist: 'Churerlia tebat', coverUrl: '/assets/albums/cover_1.jpg', year: 2024, trackCount: 12 },
  { id: 2, title: 'Frepe Fxas', artist: 'Guomas', coverUrl: '/assets/albums/cover_2.jpg', year: 2023, trackCount: 8 },
  { id: 3, title: "That's Auring", artist: 'Guomas', coverUrl: '/assets/albums/cover_3.jpg', year: 2023, trackCount: 10 },
  { id: 4, title: 'Latk Senmery Se', artist: 'Ruqwear ycord', coverUrl: '/assets/albums/cover_4.jpg', year: 2024, trackCount: 15 }
];

export const ResponsiveHomeScreen: Component<HomeScreenProps> = (props) => {
  const [isLoaded, setIsLoaded] = createSignal(false);
  const [viewportSize, setViewportSize] = createSignal('desktop');

  const isLoading = () => props.loading || !isLoaded();

  const updateViewportSize = () => {
    const width = window.innerWidth;
    if (width < 640) setViewportSize('mobile');
    else if (width < 1024) setViewportSize('tablet');
    else setViewportSize('desktop');
  };

  const handleHeroPlay = () => {
    console.log('Playing hero content: Acytel');
    if (props.onPlayHero) {
      props.onPlayHero();
    }
  };

  const handleAlbumClick = (albumId: string | number) => {
    console.log(`Navigating to album: ${albumId}`);
    if (props.onAlbumClick) {
      props.onAlbumClick(albumId);
    }
  };

  const handlePlayAlbum = (albumId: string | number) => {
    console.log(`Playing album: ${albumId}`);
    if (props.onPlayAlbum) {
      props.onPlayAlbum(albumId);
    }
  };

  onMount(() => {
    updateViewportSize();
    window.addEventListener('resize', updateViewportSize);
    setTimeout(() => setIsLoaded(true), 100);
    
    return () => window.removeEventListener('resize', updateViewportSize);
  });

  const getAlbumColumns = () => {
    switch(viewportSize()) {
      case 'mobile': return 2;
      case 'tablet': return 3;
      default: return 4;
    }
  };

  return (
    <div class="flex flex-col gap-4 sm:gap-6 lg:gap-8 relative">
      {/* Hero Section */}
      <HeroSection 
        title={HERO_DATA.title}
        subtitle={HERO_DATA.subtitle}
        description={HERO_DATA.description}
        backgroundImage={HERO_DATA.backgroundImage}
        backgroundPosition={HERO_DATA.backgroundPosition}
        loading={isLoading()}
        onPlayClick={handleHeroPlay}
        viewport={viewportSize()}
      />

      {/* Albums Section */}
      <AlbumsSection 
        title="Top Albums"
        subtitle={viewportSize() !== 'mobile' ? "Discover the most popular albums" : undefined}
        albums={ALBUMS_DATA}
        columns={getAlbumColumns()}
        showMeta={viewportSize() !== 'mobile'}
        loading={isLoading()}
        onAlbumClick={handleAlbumClick}
        onPlayAlbum={handlePlayAlbum}
        onViewAllClick={() => console.log('View all albums')}
        viewport={viewportSize()}
      />

      {/* Additional Sections for Scrolling */}
      <Show when={viewportSize() !== 'mobile'}>
        <AlbumsSection 
          title="Recently Played"
          albums={ALBUMS_DATA.slice(0, 3)}
          columns={3}
          showMeta={false}
          loading={isLoading()}
          onAlbumClick={handleAlbumClick}
          viewport={viewportSize()}
        />
      </Show>
    </div>
  );
};