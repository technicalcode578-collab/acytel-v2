import { createSignal } from "solid-js";
import { Track } from "../models/track";
import * as AudioService from "../services/audio.service";
import { getSecureTrackUrl } from "../services/track.service";
import * as CacheService from "../services/cache.service";

const [currentTrack, setCurrentTrack] = createSignal<Track | null>(null);
const [isPlaying, setIsPlaying] = createSignal(false);
const [isLoading, setIsLoading] = createSignal(false);
const [currentTime, setCurrentTime] = createSignal(0);
const [duration, setDuration] = createSignal(0);
// ADDED: The missing isSeekable signal
const [isSeekable, setIsSeekable] = createSignal(false);

let progressInterval: number;

const startProgressTracker = () => {
    clearInterval(progressInterval);
    progressInterval = window.setInterval(() => {
        const time = AudioService.getCurrentTime();
        if (duration() > 0 && time <= duration()) {
          setCurrentTime(time);
        }
        if (!isPlaying()) {
            clearInterval(progressInterval);
        }
    }, 250);
};

export const playerActions = {
    playTrack: async (track: Track) => {
        setIsLoading(true);
        setIsSeekable(false); // Playback is not seekable until the buffer is loaded
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
                setIsPlaying(true);
                setIsSeekable(true); // Now that the full buffer is loaded, seeking is possible
                startProgressTracker();
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
            setIsPlaying(false);
        } else if (currentTrack()) {
            AudioService.resume();
            setIsPlaying(true);
        }
    },

    seek: (time: number) => {
        if (isSeekable()) {
            AudioService.seek(time);
            setCurrentTime(time);
        }
    },
};

// ADDED: Export the isSeekable signal
export const playerState = { currentTrack, isPlaying, isLoading, currentTime, duration, isSeekable };