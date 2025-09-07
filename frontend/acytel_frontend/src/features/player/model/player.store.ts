// File: src/features/player/model/player.store.ts
import { createSignal, createEffect } from "solid-js";
import { Track } from "../../../entities/track/model/track.model";
import * as AudioService from "../../../shared/lib/audio.service";
import * as CacheService from "../../../shared/lib/cache.service";
import { getSecureTrackUrl } from "../../../entities/track/api/track.api"; 

const [currentTrack, setCurrentTrack] = createSignal<Track | null>(null);
const [isPlaying, setIsPlaying] = createSignal(false);
const [isLoading, setIsLoading] = createSignal(false);
const [currentTime, setCurrentTime] = createSignal(0);
const [duration, setDuration] = createSignal(0);
const [isSeekable, setIsSeekable] = createSignal(false);

createEffect(() => {
    let progressInterval: number;
    if (isPlaying()) {
        progressInterval = window.setInterval(() => {
            const time = AudioService.getCurrentTime();
            if (duration() > 0 && time <= duration()) {
                setCurrentTime(time);
            }
            if (time >= duration() && duration() > 0) {
                setIsPlaying(false);
            }
        }, 250);
    }
    return () => clearInterval(progressInterval);
});

export const playerActions = {
    playTrack: async (track: Track) => {
        if (currentTrack()?.id === track.id) {
            playerActions.togglePlayPause();
            return;
        }

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

            if (audioData) {
                const trackDuration = await AudioService.playFromBuffer(new Uint8Array(audioData));
                setDuration(trackDuration);
                setIsPlaying(true);
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
        if (!currentTrack()) return;
        if (isPlaying()) {
            AudioService.pause();
            setIsPlaying(false);
        } else {
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

export const playerState = { currentTrack, isPlaying, isLoading, currentTime, duration, isSeekable };