// File: src/widgets/player/NowPlayingSidebar.tsx (Migrated to Tailwind)
import { Component } from 'solid-js';

export const NowPlayingSidebar: Component = () => {
  return (
    <div class="bg-gray-900/60 backdrop-blur-xl border border-white/5 rounded-lg p-6 flex flex-col gap-8 h-full">
      <img 
        src="https://placehold.co/300x300/a855f7/white?text=S" 
        class="w-full aspect-square rounded-md shadow-lg transition-all duration-500 hover:scale-105 hover:shadow-2xl" 
        alt="Current Song" 
      />
      <div class="text-center">
        <h3 class="text-xl font-bold text-white">Blinding Lights</h3>
        <p class="text-gray-400">The Weeknd</p>
      </div>
      <div class="flex flex-col items-center gap-4">
        <div class="flex items-center justify-center gap-6">
          <button class="text-gray-400 hover:text-white transition-colors">⏮️</button>
          <button class="w-10 h-10 rounded-full bg-white text-black flex items-center justify-center transition-all duration-500 hover:scale-110 hover:shadow-2xl">▶️</button>
          <button class="text-gray-400 hover:text-white transition-colors">⏭️</button>
        </div>
        <div class="w-full bg-gray-600 rounded-full h-1">
          <div class="bg-white rounded-full h-1" style={{ width: '40%' }}></div>
        </div>
      </div>
      <div class="flex-grow">
        <h4 class="text-base font-bold text-white mb-4">Friend Activity</h4>
        <p class="text-gray-400">Coming soon...</p>
      </div>
    </div>
  );
};