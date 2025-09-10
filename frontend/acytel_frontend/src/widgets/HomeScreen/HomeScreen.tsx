import { Component, createSignal, onMount } from 'solid-js';
import { HeroSection } from './HeroSection/HeroSection';
import { AlbumsSection } from './ContentSections/AlbumsSection';

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
  backgroundPosition: 'calc(50% + 7cm) calc(50% + 2.4cm)'
};

const ALBUMS_DATA = [
  { id: 1, title: 'Jea Lak Up', artist: 'Churerlia tebat', coverUrl: '/assets/albums/cover_1.jpg', year: 2024, trackCount: 12 },
  { id: 2, title: 'Frepe Fxas', artist: 'Guomas', coverUrl: '/assets/albums/cover_2.jpg', year: 2023, trackCount: 8 },
  { id: 3, title: 'That\'s Auring', artist: 'Guomas', coverUrl: '/assets/albums/cover_3.jpg', year: 2023, trackCount: 10 },
  { id: 4, title: 'Latk Senmery Se', artist: 'Ruqwear ycord', coverUrl: '/assets/albums/cover_4.jpg', year: 2024, trackCount: 15 }
];

export const HomeScreen: Component<HomeScreenProps> = (props) => {
  const [isLoaded, setIsLoaded] = createSignal(false);

  const isLoading = () => props.loading || !isLoaded();

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
    setTimeout(() => setIsLoaded(true), 100);
  });

  return (
    <div class="flex flex-col gap-8 relative">
      {/* Hero Section - Universe No. 1 Architecture */}
      <HeroSection 
        title={HERO_DATA.title}
        subtitle={HERO_DATA.subtitle}
        description={HERO_DATA.description}
        backgroundImage={HERO_DATA.backgroundImage}
        backgroundPosition={HERO_DATA.backgroundPosition}
        loading={isLoading()}
        onPlayClick={handleHeroPlay}
      />

      {/* Albums Section - Universe No. 1 Architecture */}
      <AlbumsSection 
        title="Top Albums"
        subtitle="Discover the most popular albums"
        albums={ALBUMS_DATA}
        columns={4}
        showMeta={true}
        loading={isLoading()}
        onAlbumClick={handleAlbumClick}
        onPlayAlbum={handlePlayAlbum}
        onViewAllClick={() => console.log('View all albums')}
      />
    </div>
  );
};
