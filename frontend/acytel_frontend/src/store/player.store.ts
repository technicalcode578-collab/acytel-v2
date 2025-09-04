import { createSignal, createEffect } from "solid-js"; // Import createEffect
import { Track } from "../models/track";
import * as AudioService from "../services/audio.service";
import * as CacheService from "../services/cache.service";
import { getSecureTrackUrl } from "../services/track.service";

const [currentTrack, setCurrentTrack] = createSignal<Track | null>(null);
const [isPlaying, setIsPlaying] = createSignal(false);
const [isLoading, setIsLoading] = createSignal(false);
const [currentTime, setCurrentTime] = createSignal(0);
const [duration, setDuration] = createSignal(0);
const [isSeekable, setIsSeekable] = createSignal(false);

// This effect will now automatically manage the progress tracking interval.
createEffect(() => {
  let progressInterval: number;
  if (isPlaying()) {
    progressInterval = window.setInterval(() => {
      const time = AudioService.getCurrentTime();
      if (duration() > 0 && time <= duration()) {
        setCurrentTime(time);
      }
    }, 250);
  }
  // When isPlaying() becomes false, the effect re-runs and this cleanup function is called.
  return () => clearInterval(progressInterval);
});

export const playerActions = {
    playTrack: async (track: Track, playlist?: Track[]) => {
        setIsLoading(true);
        setIsSeekable(false);
        setCurrentTrack(track);
        AudioService.stop();

        try {
            let audioData = await CacheService.getTrack(track.id);

            if (!audioData) {
                const secureUrl = await getSecureTrackUrl(track.id);
                const response = await fetch(secureUrl);
                if (!response.ok) throw new Error(`Network Error: ${response.statusText}`);
                audioData = await response.arrayBuffer();
                CacheService.storeTrack(track.id, audioData.slice(0));
            }

            if(audioData){
                const trackDuration = await AudioService.playFromBuffer(new Uint8Array(audioData));
                setDuration(trackDuration);
                setIsPlaying(true); // This will now automatically start the progress tracker via the effect.
                setIsSeekable(true);
            }

        } catch (error) {
            console.error("Error playing track:", error);
            setIsPlaying(false);
        } finally {
            setIsLoading(false);
        }
    },
    
    togglePlayPause: () => {
        if (isPlaying()) {
            AudioService.pause();
            setIsPlaying(false); // The effect will automatically stop the tracker.
        } else if (currentTrack()) {
            AudioService.resume();
            setIsPlaying(true); // The effect will automatically restart the tracker.
        }
    },

    seek: (time: number) => {
        if (isSeekable()) {
            AudioService.seek(time);
            // Manually update currentTime immediately for a responsive feel.
            setCurrentTime(time);
        }
    },
};

export const playerState = { currentTrack, isPlaying, isLoading, currentTime, duration, isSeekable };