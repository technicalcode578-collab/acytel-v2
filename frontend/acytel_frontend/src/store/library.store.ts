import { createStore } from "solid-js/store";
import { Track } from "../models/track";

const [tracks, setTracks] = createStore<Track[]>([]);

export const libraryStore = {
  tracks,
  setTracks: (newTracks: Track[]) => setTracks(newTracks),
  addTrack: (track: Track) => setTracks(t => [...t, track]),
};