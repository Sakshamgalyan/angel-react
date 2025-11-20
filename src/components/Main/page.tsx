"use client";

import React, { useState, useEffect } from 'react';
import Sidebar from '../Sidebar/page';
import DataForm, { FormDataShape } from '../DataForm/page';
import ResponseDisplay from '../ResponseDisplay/page';
import Footer from '../Footer/page';
import Header from '../Header/page';

const HomePage: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [theme, setTheme] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(false);
  const [response, setResponse] = useState<{ type?: string; message?: React.ReactNode; data?: unknown } | null>(null);

  const toggleSidebar = () => setSidebarOpen((s) => !s);
  const switchTheme = (mode: number) => setTheme(mode);

  // apply persisted theme on mount and keep document class in sync
  useEffect(() => {
    try {
      const saved = localStorage.getItem('cgl-theme');
      if (saved !== null) {
        const val = Number(saved);
        setTheme(val);
        if (val === 0) document.documentElement.classList.add('dark');
        else document.documentElement.classList.remove('dark');
      } else {
        // default to system preference
        const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
        if (prefersDark) {
          setTheme(0);
          document.documentElement.classList.add('dark');
        } else {
          setTheme(1);
          document.documentElement.classList.remove('dark');
        }
      }
    } catch (e) {
      // ignore in non-browser env
    }
  }, []);

  useEffect(() => {
    try {
      if (theme === 0) {
        document.documentElement.classList.add('dark');
        localStorage.setItem('cgl-theme', '0');
      } else {
        document.documentElement.classList.remove('dark');
        localStorage.setItem('cgl-theme', '1');
      }
    } catch (e) {}
  }, [theme]);

  const handleFormSubmit = async (formData: FormDataShape) => {
    setLoading(true);
    setResponse(null);
    try {
      // TODO: replace with real API call
      await new Promise((res) => setTimeout(res, 1500));
      setResponse({ type: 'success', message: 'Fetched successfully', data: formData });
    } catch (err) {
      setResponse({ type: 'error', message: 'Request failed', data: err });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background transition-colors duration-300">
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-100 via-background to-background dark:from-slate-800 dark:via-background dark:to-background -z-10 opacity-50"></div>
      
      <Header onHamburgerClick={toggleSidebar} onThemeSwitch={switchTheme} theme={theme} />

      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8 md:py-12 flex flex-col gap-6 sm:gap-8">
        <div className="text-center max-w-3xl mx-auto space-y-3 sm:space-y-4 animate-fade-in">
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight text-foreground">
            Capital Growth <span className="text-gradient">Labs</span>
          </h1>
          <p className="text-base sm:text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed px-4">
            Analyze financial data with real-time insights and advanced technical indicators.
          </p>
        </div>

        <div className="w-full max-w-4xl mx-auto">
          <DataForm onSubmit={handleFormSubmit} loading={loading} />
        </div>

        {response && (
          <div className="w-full max-w-4xl mx-auto animate-fade-in">
            <ResponseDisplay response={response} />
          </div>
        )}
      </main>

      <Footer />

      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
    </div>
  );
};

export default HomePage;