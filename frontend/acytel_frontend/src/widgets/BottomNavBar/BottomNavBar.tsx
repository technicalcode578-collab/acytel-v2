// File: src/widgets/BottomNavBar/BottomNavBar.tsx (Corrected)
import { Component } from 'solid-js';
import { useNavigate, useLocation } from '@solidjs/router';
import { FiHome, FiSearch, FiSettings } from 'solid-icons/fi';
import { CgMathPlus } from 'solid-icons/cg';
import { IoLibraryOutline } from 'solid-icons/io';

const NavIcon = (props: { 
  label: string; 
  children: any; 
  href: string;
  isCentral?: boolean 
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  
  const isActive = location.pathname === props.href;
  
  const handleClick = () => {
    navigate(props.href);
  };
  
  const baseClass = "flex flex-col items-center justify-center transition-colors w-16 cursor-pointer";
  const centralClass = props.isCentral ? "h-8 w-8" : "h-6 w-6";
  const textColor = isActive ? "text-primary-text" : "text-muted hover:text-primary-text";
  
  return (
    <button 
      onClick={handleClick} 
      class={`${baseClass} ${textColor}`}
    >
      <div class={centralClass}>{props.children}</div>
    </button>
  );
};

export const BottomNavBar: Component = () => {
  return (
    <nav class="w-full h-[60px] bg-background flex items-center justify-around">
      <NavIcon label="Home" href="/"><FiHome /></NavIcon>
      <NavIcon label="Search" href="/search"><FiSearch /></NavIcon>
      <NavIcon label="Create" href="/create" isCentral={true}><CgMathPlus /></NavIcon>
      {/* Directive: Corrected the typo from 'LNavIcon' to 'NavIcon'. */}
      <NavIcon label="Library" href="/library"><IoLibraryOutline /></NavIcon>
      <NavIcon label="Settings" href="/settings"><FiSettings /></NavIcon>
    </nav>
  );
};