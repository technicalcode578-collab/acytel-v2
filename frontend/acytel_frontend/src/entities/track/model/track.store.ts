// File: src/entities/track/model/track.store.ts
import { createStore } from "solid-js/store";
import { Track } from "./track.model"; // CORRECTED PATH

const [tracks, setTracks] = createStore<Track[]>([]);

export const libraryStore = {
  tracks,
  setTracks: (newTracks: Track[]) => setTracks(newTracks),
  addTrack: (track: Track) => setTracks(t => [...t, track]),
};