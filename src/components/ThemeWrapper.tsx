'use client';

import { useTheme } from '@/hooks/useTheme';
import { useEffect } from 'react';

export default function ThemeWrapper({ children }: { children: React.ReactNode }) {
  const { theme } = useTheme();

  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove('light', 'dark');
    root.classList.add(theme);
  }, [theme]);

  return <>{children}</>;
}
