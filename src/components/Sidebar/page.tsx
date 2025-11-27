"use client";

import React, { useEffect } from "react";
import Link from 'next/link';
import Icon from '../Icon/Icon';

type SidebarProps = {
  open: boolean;
  onClose: () => void;
};

const Sidebar = React.memo(({ open, onClose }: SidebarProps) => {
  // Close sidebar on Escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && open) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [open, onClose]);

  return (
    <>
      <div
        className={`fixed inset-0 bg-black/60 backdrop-blur-sm z-40 transition-all duration-300 ${open ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
        onClick={onClose}
        aria-hidden={!open}
      />

      <aside 
        className={`fixed left-0 top-0 h-full w-72 z-50 glass border-r border-white/20 dark:border-slate-700/30 p-6 transform transition-transform duration-300 ease-out ${open ? 'translate-x-0' : '-translate-x-full'}`}
        aria-label="Sidebar navigation"
        role="navigation"
      >
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
            <Icon name="close" size={20} />
          </button>
        </div>

        <nav className="flex flex-col gap-2">
          <Link 
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-foreground hover:bg-primary/10 hover:text-primary transition-all duration-200 group" 
            href="/"
            onClick={onClose}
          >
            <Icon name="home" size={18} className="text-muted-foreground group-hover:text-primary transition-colors" />
            Home
          </Link>
          <Link 
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-foreground hover:bg-primary/10 hover:text-primary transition-all duration-200 group" 
            href="/"
            onClick={onClose}
          >
            <Icon name="dashboard" size={18} className="text-muted-foreground group-hover:text-primary transition-colors" />
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
});

Sidebar.displayName = 'Sidebar';

export default Sidebar;
