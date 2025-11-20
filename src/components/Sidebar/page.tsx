"use client";

import React from "react";
import Link from 'next/link';

type SidebarProps = {
  open: boolean;
  onClose: () => void;
};

function Sidebar({ open, onClose }: SidebarProps) {
  return (
    <>
      <div
        className={`fixed inset-0 bg-black/60 backdrop-blur-sm z-40 transition-all duration-300 ${open ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
        onClick={onClose}
      />

      <aside className={`fixed left-0 top-0 h-full w-72 z-50 glass border-r border-white/20 dark:border-slate-700/30 p-6 transform transition-transform duration-300 ease-out ${open ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🧠</span>
            <h2 className="text-xl font-bold text-foreground tracking-tight">CGL</h2>
          </div>
          <button 
            className="p-2 rounded-full hover:bg-accent text-muted-foreground hover:text-foreground transition-colors" 
            onClick={onClose} 
            aria-label="Close sidebar"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>

        <nav className="flex flex-col gap-2">
          <Link 
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-foreground hover:bg-primary/10 hover:text-primary transition-all duration-200 group" 
            href="/"
            onClick={onClose}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-muted-foreground group-hover:text-primary transition-colors">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
              <polyline points="9 22 9 12 15 12 15 22"></polyline>
            </svg>
            Home
          </Link>
          <Link 
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-foreground hover:bg-primary/10 hover:text-primary transition-all duration-200 group" 
            href="/"
            onClick={onClose}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-muted-foreground group-hover:text-primary transition-colors">
              <rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect>
              <line x1="8" y1="21" x2="16" y2="21"></line>
              <line x1="12" y1="17" x2="12" y2="21"></line>
            </svg>
            App Dashboard
          </Link>
        </nav>
        
        <div className="absolute bottom-6 left-6 right-6">
          <div className="p-4 rounded-xl bg-secondary/50 border border-border/50">
            <p className="text-xs text-muted-foreground mb-2">Logged in as</p>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-violet-500 flex items-center justify-center text-white text-xs font-bold">
                U
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">User</p>
                <p className="text-xs text-muted-foreground truncate">user@example.com</p>
              </div>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}

export default Sidebar;
