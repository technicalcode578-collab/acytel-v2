import { createSignal } from "solid-js";
import { Track } from "../models/track";
import * as AudioService from "../services/audio.service";
import { getSecureTrackUrl } from "../services/track.service";
import init from "../audio-engine/pkg/audio_engine.js";

const [currentTrack, setCurrentTrack] = createSignal<Track | null>(null);
const [isPlaying, setIsPlaying] = createSignal(false);
const [isLoading, setIsLoading] = createSignal(false);
const [currentTime, setCurrentTime] = createSignal(0);
const [duration, setDuration] = createSignal(0);

let progressInterval: number;

const startProgressTracker = () => {
    clearInterval(progressInterval);
    progressInterval = window.setInterval(() => {
        const time = AudioService.getCurrentTime();
        setCurrentTime(time);
        
        if (!isPlaying()) {
            clearInterval(progressInterval);
        }
    }, 250);
};

export const playerActions = {
    playTrack: async (track: Track) => {
        setIsLoading(true);
        setCurrentTrack(track);
        try {
            await AudioService.initAudioContext();
            
            const secureUrl = await getSecureTrackUrl(track.id);
            const response = await fetch(secureUrl);
            if (!response.ok) {
                throw new Error(`Failed to fetch audio data: ${response.statusText}`);
            }
            const audioData = await response.arrayBuffer();

            await init();

            await AudioService.play(new Uint8Array(audioData));

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
        } else if (currentTrack()) {
            AudioService.resume();
        }
    },

    seek: (time: number) => {
        AudioService.seek(time);
        setCurrentTime(time);
    },
    
    setPlaying: (playing: boolean) => {
        setIsPlaying(playing);
        if(playing) {
            startProgressTracker();
        } else {
            clearInterval(progressInterval);
        }
    },
    setDuration: setDuration,
};

export const playerState = { currentTrack, isPlaying, isLoading, currentTime, duration };