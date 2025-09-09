// File: src/shared/ui/Layout.tsx
import { JSX } from 'solid-js';
import { BottomNavBar } from '../../widgets/BottomNavBar/BottomNavBar';
import { PlaylistSidebar } from '../../widgets/PlaylistSidebar/PlaylistSidebar';

export default function Layout(props: { children: JSX.Element }) {
  return (
    <div class="h-screen w-screen bg-background text-primary-text flex flex-col overflow-hidden">
      
      <main class="flex-grow grid grid-cols-12 gap-4 p-4 overflow-y-auto">
        
        <div class="col-span-8">
          {props.children}
        </div>

        {/* The sidebar is no longer a placeholder. It now renders our new widget. */}
        <aside class="col-span-4">
          <PlaylistSidebar />
        </aside>

      </main>

      <footer class="flex-shrink-0">
        <BottomNavBar />
      </footer>
      
    </div>
  );
}