import { createSignal } from "solid-js";
import { Track } from "../models/track";
import * as AudioService from "../services/audio.service";
import { fetchTrackAsArrayBuffer } from "../services/track.service";

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
    if (time >= duration() && duration() > 0) {
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
      const arrayBuffer = await fetchTrackAsArrayBuffer(track.id);
      await AudioService.play(arrayBuffer);
      setIsPlaying(true);
      setDuration(AudioService.getDuration());
      startProgressTracker();
    } catch (error) {
      console.error("Error playing track:", error);
      setIsPlaying(false);
    } finally {
      setIsLoading(false);
    }
  },
  
  togglePlayPause: () => {
    // This must be called from a user gesture to initialize the context
    AudioService.initAudioContext(); 
    if (isPlaying()) {
      AudioService.pause();
      setIsPlaying(false);
      clearInterval(progressInterval);
    } else if (currentTrack()) { // Can only resume if there is a track
      AudioService.resume();
      setIsPlaying(true);
      startProgressTracker();
    }
  },

  seek: (time: number) => {
    AudioService.seek(time);
    if(!isPlaying()){
      setCurrentTime(time);
    }
  },
};

export const playerState = { currentTrack, isPlaying, isLoading, currentTime, duration };
