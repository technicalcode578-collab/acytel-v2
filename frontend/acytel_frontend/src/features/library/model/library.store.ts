// File: src/features/library/model/library.store.ts
import { createStore } from "solid-js/store";
import { Track } from "../../../shared/lib/track.model";

const [tracks, setTracks] = createStore<Track[]>([]);

export const libraryStore = {
  tracks,
  setTracks: (newTracks: Track[]) => setTracks(newTracks),
  addTrack: (track: Track) => setTracks(t => [...t, track]),
};