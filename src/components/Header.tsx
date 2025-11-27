'use client';

import Link from 'next/link';
import { Search, User, Sun, Moon } from 'lucide-react';
import { useTheme } from '@/context/theme';
import { useAuth } from '@/context/auth';

const Header = () => {
  const { theme, toggle } = useTheme();
  const { user, logout } = useAuth();

  return (
    <header className="sticky top-0 z-50 flex items-center justify-between px-4 sm:px-6 lg:px-8 py-4 border-b border-gray-200/50 dark:border-gray-800/50 bg-white/80 dark:bg-[#0B0E14]/80 backdrop-blur-xl transition-all animate-slide-in-down">
      <div className="flex items-center gap-4 sm:gap-8">
        <Link href="/" className="flex items-center gap-2 group">
          <div 
            className="w-8 h-8 rounded-lg flex items-center justify-center transform group-hover:scale-110 transition-transform duration-300"
            style={{ background: 'var(--gradient-primary)' }}
          >
            <span className="text-white font-bold text-lg">S</span>
          </div>
          <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-blue-600 dark:from-purple-400 dark:to-blue-400 hidden sm:block">
            Stocker
          </span>
        </Link>
        
        {user && (
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
            <Link 
              href="/dashboard" 
              className="text-gray-600 dark:text-gray-400 hover:text-purple-600 dark:hover:text-purple-400 transition-colors relative group"
            >
              Dashboard
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-purple-600 to-blue-600 group-hover:w-full transition-all duration-300" />
            </Link>
            <Link 
              href="/portfolio" 
              className="text-gray-600 dark:text-gray-400 hover:text-purple-600 dark:hover:text-purple-400 transition-colors relative group"
            >
              Portfolio
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-purple-600 to-blue-600 group-hover:w-full transition-all duration-300" />
            </Link>
          </nav>
        )}
      </div>

      <div className="flex items-center gap-3 sm:gap-4">
        {user && (
          <div className="relative hidden md:block">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input 
              type="text" 
              placeholder="Search" 
              className="
                bg-gray-100 dark:bg-[#1E2329]/50 
                text-sm text-gray-900 dark:text-white 
                pl-10 pr-4 py-2 rounded-xl 
                border-2 border-transparent
                focus:border-purple-500 dark:focus:border-purple-400
                focus:ring-4 focus:ring-purple-500/10
                focus:outline-none 
                w-48 lg:w-64 
                transition-all duration-300
                placeholder:text-gray-400 dark:placeholder:text-gray-500
              "
            />
          </div>
        )}

        {/* Theme Toggle */}
        <button 
          onClick={toggle}
          className="
            relative w-14 h-7 rounded-full 
            bg-gray-200 dark:bg-[#2A2E37] 
            flex items-center px-1 
            transition-colors duration-300
            hover:bg-gray-300 dark:hover:bg-[#3A3E47]
            focus:outline-none focus:ring-2 focus:ring-purple-500/50
          "
          aria-label="Toggle theme"
        >
          <div className={`
            absolute w-5 h-5 rounded-full bg-white shadow-md 
            transform transition-all duration-300 
            flex items-center justify-center
            ${theme === 'dark' ? 'translate-x-7' : 'translate-x-0'}
          `}>
            {theme === 'dark' ? (
              <Moon className="w-3 h-3 text-purple-500" />
            ) : (
              <Sun className="w-3 h-3 text-orange-500" />
            )}
          </div>
        </button>

        {user ? (
          <>
            <button 
              onClick={logout}
              className="
                hidden sm:block
                px-4 py-2 rounded-xl text-sm font-semibold
                text-white
                transition-all duration-300
                transform hover:scale-105 active:scale-95
                shadow-md hover:shadow-lg
              "
              style={{ background: 'var(--gradient-secondary)' }}
            >
              Log Out
            </button>
            <div className="flex items-center gap-2">
              <button className="
                w-9 h-9 rounded-full 
                bg-gradient-to-br from-purple-500 to-blue-500
                flex items-center justify-center 
                text-white
                hover:scale-110 transition-transform duration-300
                shadow-md
              ">
                <User className="w-4 h-4" />
              </button>
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300 hidden lg:block">
                {user.name}
              </span>
            </div>
          </>
        ) : (
          <div className="text-sm text-gray-500 dark:text-gray-400">
            Welcome
          </div>
        )}
      </div>
    </header>
  )
}

export default Header
