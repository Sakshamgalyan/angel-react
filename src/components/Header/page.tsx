"use client";

import React from 'react';

type HeaderProps = {
  onHamburgerClick: () => void;
  onThemeSwitch: (mode: number) => void;
  theme?: number;
};

function Header({ onHamburgerClick, onThemeSwitch, theme }: HeaderProps) {
  return (
    <header className="sticky top-0 z-50 w-full glass border-b border-border/40">
      <div className="max-w-7xl mx-auto px-4 md:px-6 h-16 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button 
            className="md:hidden p-2 rounded-lg hover:bg-accent transition-colors text-foreground" 
            onClick={() => onHamburgerClick()} 
            aria-label="Open sidebar"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="3" y1="12" x2="21" y2="12"></line>
              <line x1="3" y1="6" x2="21" y2="6"></line>
              <line x1="3" y1="18" x2="21" y2="18"></line>
            </svg>
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
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
              </svg>
            </button>
            <button 
              className={`p-2 rounded-full transition-all duration-300 ${theme === 1 ? 'bg-background shadow-sm text-orange-500' : 'text-muted-foreground hover:text-foreground'}`}
              onClick={() => onThemeSwitch(1)} 
              title="Light Mode"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="5"></circle>
                <line x1="12" y1="1" x2="12" y2="3"></line>
                <line x1="12" y1="21" x2="12" y2="23"></line>
                <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
                <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
                <line x1="1" y1="12" x2="3" y2="12"></line>
                <line x1="21" y1="12" x2="23" y2="12"></line>
                <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
                <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
              </svg>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}

export default Header;
