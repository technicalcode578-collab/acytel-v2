// File: src/features/search/model/search.store.ts
import { createStore } from "solid-js/store";
import { Track } from "../../../shared/lib/track.model";

interface SearchState {
  query: string;
  results: Track[];
  isSearching: boolean;
}

const [searchState, setSearchState] = createStore<SearchState>({
  query: "",
  results: [],
  isSearching: false,
});

export const searchActions = {
  setQuery: (query: string) => setSearchState("query", query),
  setResults: (results: any[]) => {
    // The 'document' field from the Typesense/Meilisearch response contains our track object
    const tracks = results.map(hit => hit.document);
    setSearchState({ results: tracks, isSearching: false });
  },
  setSearching: () => setSearchState("isSearching", true),
  clearSearch: () => setSearchState({ query: "", results: [], isSearching: false }),
};

export default searchState;