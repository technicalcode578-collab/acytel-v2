import { createSignal } from "solid-js";
import { Track } from "../models/track";
import * as AudioService from "../services/audio.service";
import { fetchTrackAsStream } from "../services/track.service";

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

        if (!isPlaying() || (time >= duration() && duration() > 0)) {
            setIsPlaying(false);
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
            const stream = await fetchTrackAsStream(track.id);
            await AudioService.play(stream);
            // Duration and progress are now handled by the audio service callbacks and tracker
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

    // Actions for the audio service to call back into the store
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