"use client";

import React from 'react';
import Icon from '../Icon/Icon';
import type { Theme } from '@/types/types';

type HeaderProps = {
  onHamburgerClick: () => void;
  onThemeSwitch: (mode: Theme) => void;
  theme?: Theme;
};

const Header = React.memo(({ onHamburgerClick, onThemeSwitch, theme }: HeaderProps) => {
  return (
    <header className="sticky top-0 z-50 w-full glass border-b border-border/40">
      <div className="max-w-7xl mx-auto px-4 md:px-6 h-16 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button 
            className="md:hidden p-2 rounded-lg hover:bg-accent transition-colors text-foreground" 
            onClick={onHamburgerClick} 
            aria-label="Open sidebar"
          >
            <Icon name="menu" size={24} />
          </button>
          
          <div className="flex items-center gap-2">
            <span className="text-2xl">🧠</span>
            <span className="hidden sm:inline-block font-bold text-xl tracking-tight text-foreground">
              Capital Growth Labs
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center bg-secondary/50 rounded-full p-1 border border-border/50">
            <button 
              className={`p-2 rounded-full transition-all duration-300 ${theme === 0 ? 'bg-background shadow-sm text-yellow-400' : 'text-muted-foreground hover:text-foreground'}`}
              onClick={() => onThemeSwitch(0)} 
              title="Dark Mode"
              aria-label="Switch to dark mode"
            >
              <Icon name="moon" size={18} />
            </button>
            <button 
              className={`p-2 rounded-full transition-all duration-300 ${theme === 1 ? 'bg-background shadow-sm text-orange-500' : 'text-muted-foreground hover:text-foreground'}`}
              onClick={() => onThemeSwitch(1)} 
              title="Light Mode"
              aria-label="Switch to light mode"
            >
              <Icon name="sun" size={18} />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
});

Header.displayName = 'Header';

export default Header;
