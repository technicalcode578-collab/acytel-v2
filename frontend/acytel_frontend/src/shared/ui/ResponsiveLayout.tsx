// File: src/shared/ui/ResponsiveLayout.tsx
import { JSX, createSignal, onMount, onCleanup, Show, Component } from 'solid-js';
import { BottomNavBar } from '../../widgets/BottomNavBar/BottomNavBar';
import { PlaylistSidebar } from '../../widgets/PlaylistSidebar/PlaylistSidebar';
import { MobilePlayer } from '../../widgets/player/MobilePlayer';

// Breakpoint detection hook
const useBreakpoint = () => {
  const [isMobile, setIsMobile] = createSignal(false);
  const [isTablet, setIsTablet] = createSignal(false);
  const [isDesktop, setIsDesktop] = createSignal(false);
  const [sidebarOpen, setSidebarOpen] = createSignal(false);

  const updateBreakpoints = () => {
    const width = window.innerWidth;
    setIsMobile(width < 768);
    setIsTablet(width >= 768 && width < 1280);
    setIsDesktop(width >= 1280);
    
    // Auto-close sidebar on mobile
    if (width < 768) {
      setSidebarOpen(false);
    }
  };

  onMount(() => {
    updateBreakpoints();
    window.addEventListener('resize', updateBreakpoints);
  });

  onCleanup(() => {
    window.removeEventListener('resize', updateBreakpoints);
  });

  return { isMobile, isTablet, isDesktop, sidebarOpen, setSidebarOpen };
};

// Mobile Header Component
const MobileHeader: Component<{ onMenuClick: () => void }> = (props) => {
  return (
    <header class="lg:hidden fixed top-0 left-0 right-0 h-14 bg-background/95 backdrop-blur-lg border-b border-surface z-40 flex items-center justify-between px-4">
      <button 
        onClick={props.onMenuClick}
        class="p-2 hover:bg-surface/50 rounded-lg transition-colors"
        aria-label="Toggle menu"
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <path d="M3 12h18M3 6h18M3 18h18" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
        </svg>
      </button>
      
      <div class="font-bold text-lg">Acytel</div>
      
      <button class="p-2 hover:bg-surface/50 rounded-lg transition-colors">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
        </svg>
      </button>
    </header>
  );
};

// Mobile Sidebar Overlay
const MobileSidebar: Component<{ 
  isOpen: boolean; 
  onClose: () => void;
}> = (props) => {
  return (
    <>
      {/* Backdrop */}
      <div 
        class={`lg:hidden fixed inset-0 bg-black/50 z-40 transition-opacity duration-300 ${
          props.isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        onClick={props.onClose}
      />
      
      {/* Sidebar */}
      <aside 
        class={`lg:hidden fixed top-0 right-0 h-full w-80 max-w-[85vw] bg-background z-50 transition-transform duration-300 transform ${
          props.isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div class="flex items-center justify-between p-4 border-b border-surface">
          <h2 class="text-lg font-bold">Playlist</h2>
          <button 
            onClick={props.onClose}
            class="p-2 hover:bg-surface/50 rounded-lg transition-colors"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
            </svg>
          </button>
        </div>
        <div class="overflow-y-auto h-[calc(100%-4rem)]">
          <PlaylistSidebar />
        </div>
      </aside>
    </>
  );
};

// Desktop Sidebar
const DesktopSidebar: Component = () => {
  return (
    <aside class="hidden lg:block xl:col-span-3 lg:col-span-4 h-full overflow-y-auto">
      <PlaylistSidebar />
    </aside>
  );
};

// Main Responsive Layout
export default function ResponsiveLayout(props: { children: JSX.Element }) {
  const { isMobile, isTablet, isDesktop, sidebarOpen, setSidebarOpen } = useBreakpoint();

  const getMainContentClass = () => {
    if (isMobile()) {
      return "col-span-12 px-4 pt-16 pb-32";
    }
    if (isTablet()) {
      return "col-span-12 lg:col-span-8 px-6 pb-24";
    }
    // Desktop
    return "xl:col-span-9 lg:col-span-8 col-span-12 px-6 pb-4";
  };

  return (
    <div class="h-screen w-screen bg-background text-primary-text flex flex-col overflow-hidden">
      {/* Mobile Header */}
      <Show when={isMobile() || isTablet()}>
        <MobileHeader onMenuClick={() => setSidebarOpen(!sidebarOpen())} />
      </Show>

      {/* Main Content Area */}
      <main class="flex-grow grid grid-cols-12 gap-0 lg:gap-4 lg:p-4 overflow-hidden">
        {/* Content */}
        <div class={`${getMainContentClass()} overflow-y-auto`}>
          <div class="max-w-[1600px] mx-auto">
            {props.children}
          </div>
        </div>

        {/* Desktop Sidebar */}
        <Show when={isDesktop()}>
          <DesktopSidebar />
        </Show>
      </main>

      {/* Mobile Sidebar Overlay */}
      <MobileSidebar 
        isOpen={sidebarOpen()} 
        onClose={() => setSidebarOpen(false)} 
      />

      {/* Bottom Navigation - Mobile/Tablet */}
      <Show when={isMobile() || isTablet()}>
        <footer class="fixed bottom-0 left-0 right-0 z-30">
          <Show when={isMobile()}>
            <MobilePlayer />
          </Show>
          <BottomNavBar />
        </footer>
      </Show>

      {/* Desktop Bottom Bar */}
      <Show when={isDesktop()}>
        <footer class="flex-shrink-0">
          <BottomNavBar />
        </footer>
      </Show>
    </div>
  );
}