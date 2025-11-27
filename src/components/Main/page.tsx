"use client";

import React, { useState, useCallback } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import Sidebar from '../Sidebar/page';
import DataForm from '../DataForm/page';
import ResponseDisplay from '../ResponseDisplay/page';
import Footer from '../Footer/page';
import Header from '../Header/page';
import { useTheme } from '@/hooks/useTheme';
import type { FormDataShape, ResponseShape } from '@/types/types';

const HomePage: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [response, setResponse] = useState<ResponseShape | null>(null);
  
  const { theme, switchTheme } = useTheme();
  const { scrollYProgress } = useScroll();
  
  // Parallax effects
  const y1 = useTransform(scrollYProgress, [0, 1], [0, -50]);
  const y2 = useTransform(scrollYProgress, [0, 1], [0, -100]);
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);

  const toggleSidebar = useCallback(() => setSidebarOpen((s) => !s), []);
  const closeSidebar = useCallback(() => setSidebarOpen(false), []);

  const handleFormSubmit = useCallback(async (formData: FormDataShape) => {
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
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-background transition-colors duration-300 relative overflow-hidden">
      {/* Enhanced Animated Background */}
      <div className="fixed inset-0 -z-10 opacity-50">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-100 via-background to-background dark:from-slate-800 dark:via-background dark:to-background"></div>
        
        {/* Floating 3D Elements */}
        <motion.div
          className="absolute top-20 left-10 w-64 h-64 bg-gradient-to-br from-blue-400/20 to-purple-400/20 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.2, 1],
            x: [0, 30, 0],
            y: [0, -30, 0],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        <motion.div
          className="absolute bottom-20 right-10 w-80 h-80 bg-gradient-to-br from-purple-400/20 to-pink-400/20 rounded-full blur-3xl"
          animate={{
            scale: [1.2, 1, 1.2],
            x: [0, -40, 0],
            y: [0, 40, 0],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        <motion.div
          className="absolute top-1/2 left-1/2 w-96 h-96 bg-gradient-to-br from-indigo-400/10 to-cyan-400/10 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.3, 1],
            rotate: [0, 180, 360],
          }}
          transition={{
            duration: 15,
            repeat: Infinity,
            ease: "linear",
          }}
        />
      </div>
      
      <Header onHamburgerClick={toggleSidebar} onThemeSwitch={switchTheme} theme={theme} />

      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8 md:py-12 flex flex-col gap-6 sm:gap-8 relative z-10">
        {/* Hero Section with 3D Effects */}
        <motion.div 
          style={{ y: y1, opacity }}
          className="text-center max-w-3xl mx-auto space-y-3 sm:space-y-4"
        >
          <motion.h1 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight text-foreground"
          >
            <motion.span
              animate={{
                backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
              }}
              transition={{
                duration: 5,
                repeat: Infinity,
                ease: "linear",
              }}
              style={{
                backgroundSize: '200% 200%',
              }}
              className="inline-block bg-gradient-to-r from-blue-600 via-purple-600 to-blue-600 bg-clip-text text-transparent"
            >
              Capital Growth
            </motion.span>{' '}
            <span className="text-gradient">Labs</span>
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-base sm:text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed px-4"
          >
            Analyze financial data with real-time insights and advanced technical indicators.
          </motion.p>
        </motion.div>

        {/* Data Form with 3D Card Effect */}
        <motion.div 
          style={{ y: y2 }}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="w-full max-w-4xl mx-auto"
        >
          <motion.div
            whileHover={{ 
              scale: 1.01,
              rotateX: 2,
              rotateY: 2,
            }}
            transition={{ type: "spring", stiffness: 300 }}
            style={{
              transformStyle: 'preserve-3d',
              perspective: 1000,
            }}
          >
            <DataForm onSubmit={handleFormSubmit} loading={loading} />
          </motion.div>
        </motion.div>

        {/* Response Display with Fade Animation */}
        {response && (
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -30 }}
            transition={{ duration: 0.5 }}
            className="w-full max-w-4xl mx-auto"
          >
            <ResponseDisplay response={response} />
          </motion.div>
        )}

        {/* Floating Decorative Elements */}
        <motion.div
          className="absolute top-40 right-20 w-20 h-20 opacity-20"
          animate={{
            y: [0, -20, 0],
            rotate: [0, 180, 360],
          }}
          transition={{
            duration: 6,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        >
          <div className="w-full h-full bg-gradient-to-br from-blue-500 to-purple-500 rounded-lg transform rotate-45" />
        </motion.div>

        <motion.div
          className="absolute bottom-40 left-20 w-16 h-16 opacity-20"
          animate={{
            y: [0, 20, 0],
            rotate: [360, 180, 0],
          }}
          transition={{
            duration: 7,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        >
          <div className="w-full h-full bg-gradient-to-br from-purple-500 to-pink-500 rounded-full" />
        </motion.div>
      </main>

      <Footer />

      <Sidebar open={sidebarOpen} onClose={closeSidebar} />
    </div>
  );
};

export default HomePage;