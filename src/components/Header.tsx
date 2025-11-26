'use client';

import Link from 'next/link';
import { Search, User, Sun, Moon } from 'lucide-react';
import { useTheme } from '@/context/theme';
import { useAuth } from '@/context/auth';

const Header = () => {
  const { theme, toggle } = useTheme();
  const { user, logout } = useAuth();

  return (
    <header className="flex items-center justify-between px-8 py-4 border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0B0E14] transition-colors">
      <div className="flex items-center gap-8">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-6 h-6 bg-blue-600 rounded-sm"></div>
          <span className="text-xl font-bold text-black dark:text-white">Stocker</span>
        </Link>
        
        {user && (
          <nav className="hidden md:flex items-center gap-6 text-sm text-gray-500 dark:text-gray-400">
            <Link href="/dashboard" className="hover:text-black dark:hover:text-white transition-colors">Dashboard</Link>
            <Link href="/portfolio" className="hover:text-black dark:hover:text-white transition-colors">Portfolio</Link>
          </nav>
        )}
      </div>

      <div className="flex items-center gap-4">
        {user && (
          <div className="relative hidden md:block">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <input 
              type="text" 
              placeholder="Search" 
              className="bg-gray-100 dark:bg-[#1E2329] text-sm text-black dark:text-white pl-10 pr-4 py-2 rounded-md border border-gray-200 dark:border-gray-800 focus:outline-none focus:border-blue-600 w-64 transition-colors"
            />
          </div>
        )}

        <button 
          onClick={toggle}
          className="w-14 h-7 rounded-full bg-gray-200 dark:bg-[#2A2E37] flex items-center px-1 transition-colors relative"
        >
          <div className={`absolute w-5 h-5 rounded-full bg-white shadow-md transform transition-transform duration-300 flex items-center justify-center ${theme === 'dark' ? 'translate-x-7' : 'translate-x-0'}`}>
            {theme === 'dark' ? <Moon className="w-3 h-3 text-blue-500" /> : <Sun className="w-3 h-3 text-orange-500" />}
          </div>
        </button>

        {user ? (
          <>
            <button 
              onClick={logout}
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
            >
              Log Out
            </button>
            <div className="flex items-center gap-2">
              <button className="w-8 h-8 rounded-full bg-gray-100 dark:bg-[#2A2E37] flex items-center justify-center text-gray-600 dark:text-orange-200">
                <User className="w-4 h-4" />
              </button>
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300 hidden sm:block">{user.name}</span>
            </div>
          </>
        ) : (
          <div className="text-sm text-gray-500">
            Welcome
          </div>
        )}
      </div>
    </header>
  )
}

export default Header
