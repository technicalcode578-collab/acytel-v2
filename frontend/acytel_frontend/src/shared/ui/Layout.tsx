// File: src/shared/ui/Layout.tsx
import { JSX } from 'solid-js';
import { PlaylistSidebar } from '../../features/playlist/ui/PlaylistSidebar';
import { Player } from '../../features/player/ui/Player';

export default function Layout(props: { children: JSX.Element }) {
  return (
    <div class="bg-gray-900 text-white min-h-screen">
      <div class="flex h-screen">
        <PlaylistSidebar />
        <div class="flex-1 flex flex-col overflow-hidden">
          <div class="flex-1 overflow-y-auto pb-20">
            <div class="container mx-auto p-4 md:p-8">
              {props.children}
            </div>
          </div>
        </div>
      </div>
      <Player />
    </div>
  );
}