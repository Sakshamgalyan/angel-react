"use client";

import { useEffect } from 'react';
import { useLocalStorage } from './useLocalStorage';
import type { Theme } from '@/types/types';

/**
 * Custom hook for managing theme with localStorage persistence and system preference detection
 */
export function useTheme() {
    const [theme, setTheme] = useLocalStorage<Theme>('cgl-theme', 0);

    // Apply theme on mount and detect system preference
    useEffect(() => {
        if (typeof window === 'undefined') return;

        const savedTheme = localStorage.getItem('cgl-theme');

        if (savedTheme === null) {
            // No saved preference, use system preference
            const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
            const systemTheme: Theme = prefersDark ? 0 : 1;
            setTheme(systemTheme);
        }
    }, [setTheme]);

    // Update document class when theme changes
    useEffect(() => {
        if (typeof window === 'undefined') return;

        if (theme === 0) {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
    }, [theme]);

    const switchTheme = (mode: Theme) => {
        setTheme(mode);
    };

    return { theme, switchTheme };
}
