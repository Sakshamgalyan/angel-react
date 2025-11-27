'use client';

import React, { useState } from 'react';
import { FormInput } from './ui/FormInput';
import { Select } from './ui/Select';
import { Checkbox } from './ui/Checkbox';
import { Button } from './ui/Button';

const Hero = () => {
  const [formData, setFormData] = useState({
    instrumentSymbol: '',
    timeframe: '',
    dataTime: '',
    includeTechnicalIndicators: false,
    includeFundamentals: false,
    includeNewsSentiment: false,
    includePeerBetaAnalysis: false,
  });

  const timeframeOptions = [
    { value: '1m', label: '1 Minute' },
    { value: '5m', label: '5 Minutes' },
    { value: '15m', label: '15 Minutes' },
    { value: '30m', label: '30 Minutes' },
    { value: '1h', label: '1 Hour' },
    { value: '4h', label: '4 Hours' },
    { value: '1d', label: '1 Day' },
    { value: '1w', label: '1 Week' },
    { value: '1M', label: '1 Month' },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Form submitted:', formData);
    // Handle form submission logic here
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  return (
    <section className="flex flex-col items-center justify-center pt-12 sm:pt-16 lg:pt-20 pb-8 sm:pb-12 px-4 relative overflow-hidden">
      {/* Animated gradient background */}
      <div 
        className="absolute inset-0 opacity-30"
        style={{ background: 'var(--gradient-mesh)' }}
      />
      
      {/* Floating orbs */}
      <div className="absolute top-10 left-10 w-64 h-64 bg-purple-400 dark:bg-purple-600 rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-xl opacity-20 animate-float-slow" />
      <div className="absolute bottom-10 right-10 w-64 h-64 bg-blue-400 dark:bg-blue-600 rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-xl opacity-20 animate-float" style={{ animationDelay: '2s' }} />

      <div className="w-full max-w-3xl relative z-10 animate-slide-in-up">
        {/* Glass card with 3D floating effect */}
        <div className="bg-white/80 dark:bg-[#1E2329]/80 backdrop-blur-xl border border-gray-200/50 dark:border-gray-700/50 rounded-2xl p-6 sm:p-8 lg:p-10 shadow-3d animate-float">
          <div className="text-center mb-8">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-blue-600 dark:from-purple-400 dark:to-blue-400 mb-3">
              Market Analysis
            </h2>
            <p className="text-gray-600 dark:text-gray-400 text-sm sm:text-base">
              Get comprehensive stock market insights in real-time
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Instrument Symbol */}
            <div>
              <h3 className="text-gray-900 dark:text-white font-semibold mb-3 text-left text-sm sm:text-base">
                Instrument Symbol
              </h3>
              <FormInput
                label="e.g., RELIANCE-EQ, NIFTY25JUL22000CE"
                name="instrumentSymbol"
                value={formData.instrumentSymbol}
                onChange={handleInputChange}
              />
              <div className="mt-2 text-left">
                <a 
                  href="#" 
                  className="text-purple-600 dark:text-purple-400 hover:text-purple-500 dark:hover:text-purple-300 text-xs sm:text-sm inline-flex items-center gap-1 transition-colors"
                >
                  <span className="text-red-500">📍</span>
                  View accepted symbol formats
                </a>
              </div>
            </div>

            {/* Timeframe */}
            <div>
              <h3 className="text-gray-900 dark:text-white font-semibold mb-3 text-left text-sm sm:text-base">
                Timeframe
              </h3>
              <Select
                label="Select Timeframe"
                name="timeframe"
                options={timeframeOptions}
                value={formData.timeframe}
                onChange={handleInputChange}
              />
            </div>

            {/* Data Time */}
            <div>
              <h3 className="text-gray-900 dark:text-white font-semibold mb-3 text-left text-sm sm:text-base">
                Data Time <span className="text-gray-500 dark:text-gray-400 font-normal text-xs">(optional, YYYY-MM-DD HH:MM IST)</span>
              </h3>
              <FormInput
                label="e.g., 2025-07-29 12:00"
                name="dataTime"
                value={formData.dataTime}
                onChange={handleInputChange}
              />
              <p className="mt-2 text-xs sm:text-sm text-gray-500 dark:text-gray-400 text-left">
                Data Time is optional, defaults to current time (market close if after 15:30 in IST).
              </p>
            </div>

            {/* Select Data to Fetch */}
            <div>
              <h3 className="text-gray-900 dark:text-white font-semibold mb-4 text-left text-sm sm:text-base">
                Select Data to Fetch
              </h3>
              <div className="space-y-3 bg-gray-50/80 dark:bg-[#0B0E14]/50 border border-gray-200/50 dark:border-gray-700/50 rounded-xl p-4 sm:p-5 backdrop-blur-sm">
                <Checkbox
                  label="Include Technical Indicators"
                  name="includeTechnicalIndicators"
                  checked={formData.includeTechnicalIndicators}
                  onChange={handleInputChange}
                />
                <Checkbox
                  label="Include Fundamentals"
                  name="includeFundamentals"
                  checked={formData.includeFundamentals}
                  onChange={handleInputChange}
                />
                <Checkbox
                  label="Include News & Sentiment"
                  name="includeNewsSentiment"
                  checked={formData.includeNewsSentiment}
                  onChange={handleInputChange}
                />
                <Checkbox
                  label="Include Peer/Beta Analysis"
                  name="includePeerBetaAnalysis"
                  checked={formData.includePeerBetaAnalysis}
                  onChange={handleInputChange}
                />
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-2">
              <Button
                type="submit"
                variant="gradient"
                size="lg"
                className="w-full flex items-center justify-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                Analyze Market Data
              </Button>
            </div>
          </form>
        </div>
      </div>
    </section>
  );
};

export default Hero;
