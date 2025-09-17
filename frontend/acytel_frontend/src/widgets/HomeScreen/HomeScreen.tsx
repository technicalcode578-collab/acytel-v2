import { Component, createResource } from 'solid-js';
import { HeroSection } from './HeroSection/HeroSection';
import { AlbumsSection } from './ContentSections/AlbumsSection';
import { getPublicTracks } from '../../entities/track/api/track.api';
import { Track } from '../../entities/track/model/track.model';

interface HomeScreenProps {
  onPlayHero?: () => void;
  onAlbumClick?: (albumId: string | number) => void;
  onPlayAlbum?: (albumId: string | number) => void;
}

const HERO_DATA = {
  title: 'Acytel',
  subtitle: 'Universe No. 1 Music',
  description: 'Explore a universe of music, beyond the stars.',
  backgroundImage: '/assets/album_header_bg.png',
  backgroundPosition: 'calc(50% + 7cm) calc(50% + 2.4cm)'
};

export const HomeScreen: Component<HomeScreenProps> = (props) => {
  const [tracks] = createResource<Track[]>(getPublicTracks);

  const albumsData = () => tracks()?.map(track => ({
    id: track.id,
    title: track.title,
    artist: track.artist,
    coverUrl: track.artworkPath || '/assets/albums/cover_1.jpg', // Placeholder
    year: new Date(track.createdAt).getFullYear(),
    trackCount: 1
  })) || [];

  const handleHeroPlay = () => {
    console.log('Playing hero content: Acytel');
    if (props.onPlayHero) {
      props.onPlayHero();
    }
  };

  const handleAlbumClick = (albumId: string | number) => {
    console.log(`Navigating to track: ${albumId}`);
    if (props.onAlbumClick) {
      props.onAlbumClick(albumId);
    }
  };

  const handlePlayAlbum = (albumId: string | number) => {
    console.log(`Playing track: ${albumId}`);
    if (props.onPlayAlbum) {
      props.onPlayAlbum(albumId);
    }
  };

  return (
    <div class="flex flex-col gap-8 relative">
      <HeroSection 
        title={HERO_DATA.title}
        subtitle={HERO_DATA.subtitle}
        description={HERO_DATA.description}
        backgroundImage={HERO_DATA.backgroundImage}
        backgroundPosition={HERO_DATA.backgroundPosition}
        loading={tracks.loading}
        onPlayClick={handleHeroPlay}
      />

      <AlbumsSection 
        title="Public Tracks"
        subtitle="Recently uploaded by the community"
        albums={albumsData()}
        columns={4}
        showMeta={true}
        loading={tracks.loading}
        onAlbumClick={handleAlbumClick}
        onPlayAlbum={handlePlayAlbum}
        onViewAllClick={() => console.log('View all tracks')}
      />
    </div>
  );
};