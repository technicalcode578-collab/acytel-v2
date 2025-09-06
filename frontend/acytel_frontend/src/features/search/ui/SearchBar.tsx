// File: src/features/search/ui/SearchBar.tsx
import { Component } from "solid-js";
import searchState, { searchActions } from "../model/search.store";
import { searchTracks } from "../../library/api/track.service";

export const SearchBar: Component = () => {
  let debounceTimeout: number;

  const handleInput = (e: Event) => {
    const query = (e.currentTarget as HTMLInputElement).value;
    searchActions.setQuery(query);

    clearTimeout(debounceTimeout);

    if (query.trim() === "") {
      searchActions.clearSearch();
      return;
    }

    searchActions.setSearching();

    debounceTimeout = window.setTimeout(async () => {
      try {
        const results = await searchTracks(query);
        searchActions.setResults(results);
      } catch (error) {
        console.error("Search failed", error);
        searchActions.clearSearch();
      }
    }, 300);
  };

  return (
    <div class="mb-8">
      <input
        type="search"
        placeholder="Search your library..."
        class="appearance-none block w-full px-4 py-3 border border-gray-600 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-gray-700 text-white"
        value={searchState.query}
        onInput={handleInput}
      />
    </div>
  );
};