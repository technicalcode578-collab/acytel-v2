// File: src/widgets/BottomNavBar/ResponsiveBottomNavBar.tsx
import { Component, createSignal, onMount } from 'solid-js';
import { useNavigate, useLocation } from '@solidjs/router';

interface NavItem {
  label: string;
  href: string;
  icon: (isActive: boolean) => any;
  isCentral?: boolean;
}

const navItems: NavItem[] = [
  {
    label: 'Home',
    href: '/',
    icon: (isActive) => (
      <svg width="24" height="24" viewBox="0 0 24 24" fill={isActive ? 'currentColor' : 'none'}>
        <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" stroke="currentColor" stroke-width="2"/>
        <path d="M9 22V12h6v10" stroke="currentColor" stroke-width="2"/>
      </svg>
    )
  },
  {
    label: 'Search',
    href: '/search',
    icon: (isActive) => (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        <circle cx="11" cy="11" r="8" stroke="currentColor" stroke-width={isActive ? "2.5" : "2"}/>
        <path d="M21 21l-4.35-4.35" stroke="currentColor" stroke-width={isActive ? "2.5" : "2"} stroke-linecap="round"/>
      </svg>
    )
  },
  {
    label: 'Create',
    href: '/create',
    isCentral: true,
    icon: (isActive) => (
      <svg width="28" height="28" viewBox="0 0 24 24" fill={isActive ? 'currentColor' : 'none'}>
        <rect x="3" y="3" width="18" height="18" rx="2" stroke="currentColor" stroke-width="2"/>
        <path d="M12 8v8M8 12h8" stroke={isActive ? 'white' : 'currentColor'} stroke-width="2" stroke-linecap="round"/>
      </svg>
    )
  },
  {
    label: 'Library',
    href: '/library',
    icon: (isActive) => (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        <rect x="3" y="3" width="7" height="7" stroke="currentColor" stroke-width={isActive ? "2.5" : "2"}/>
        <rect x="14" y="3" width="7" height="7" stroke="currentColor" stroke-width={isActive ? "2.5" : "2"}/>
        <rect x="14" y="14" width="7" height="7" stroke="currentColor" stroke-width={isActive ? "2.5" : "2"}/>
        <rect x="3" y="14" width="7" height="7" stroke="currentColor" stroke-width={isActive ? "2.5" : "2"}/>
      </svg>
    )
  },
  {
    label: 'Settings',
    href: '/settings',
    icon: (isActive) => (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="12" r="3" stroke="currentColor" stroke-width={isActive ? "2.5" : "2"}/>
        <path d="M12 1v6m0 6v6m11-7h-6m-6 0H1" stroke="currentColor" stroke-width={isActive ? "2.5" : "2"}/>
      </svg>
    )
  }
];

const NavIcon: Component<{ item: NavItem }> = (props) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isPressed, setIsPressed] = createSignal(false);
  
  const isActive = () => location.pathname === props.item.href;
  
  const handleClick = () => {
    setIsPressed(true);
    setTimeout(() => setIsPressed(false), 200);
    navigate(props.item.href);
  };
  
  const buttonClass = () => {
    const base = "relative flex flex-col items-center justify-center transition-all duration-200";
    const size = props.item.isCentral 
      ? "w-14 h-14 sm:w-16 sm:h-16 -mt-2" 
      : "w-14 h-14 sm:w-16 sm:h-16";
    const color = isActive() 
      ? "text-accent" 
      : "text-muted hover:text-primary-text";
    const pressed = isPressed() ? "scale-95" : "";
    const central = props.item.isCentral 
      ? "bg-accent/10 rounded-full border-2 border-accent/20" 
      : "";
    
    return `${base} ${size} ${color} ${pressed} ${central}`;
  };
  
  const iconSize = () => props.item.isCentral ? "scale-110" : "";
  
  return (
    <button 
      onClick={handleClick} 
      class={buttonClass()}
      aria-label={props.item.label}
    >
      <div class={`transition-transform ${iconSize()} ${isActive() ? 'scale-110' : ''}`}>
        {props.item.icon(isActive())}
      </div>
      {/* Label - visible on larger screens */}
      <span class={`
        text-[10px] sm:text-xs mt-1 
        ${props.item.isCentral ? 'hidden' : 'block'}
        ${isActive() ? 'font-semibold' : 'font-medium'}
      `}>
        {props.item.label}
      </span>
      
      {/* Active indicator dot */}
      {isActive() && !props.item.isCentral && (
        <div class="absolute -bottom-1 w-1 h-1 bg-accent rounded-full"></div>
      )}
    </button>
  );
};

export const BottomNavBar: Component = () => {
  const [isVisible, setIsVisible] = createSignal(true);
  let lastScrollY = 0;

  onMount(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      setIsVisible(currentScrollY <= lastScrollY || currentScrollY < 50);
      lastScrollY = currentScrollY;
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  });

  return (
    <nav class={`
      w-full h-16 sm:h-20 lg:h-[44px] 
      bg-background/95 backdrop-blur-lg
      border-t border-surface/50
      flex items-center justify-around
      transition-transform duration-300
      ${isVisible() ? 'translate-y-0' : 'translate-y-full'}
    `}>
      {navItems.map(item => <NavIcon item={item} />)}
    </nav>
  );
};