import { createSignal } from "solid-js";

export type MainView = "HOME" | "PLAYLIST" | "LIBRARY";

const [currentView, setCurrentView] = createSignal<MainView>("HOME");

export const viewStore = {
  currentView,
  setCurrentView,
};
