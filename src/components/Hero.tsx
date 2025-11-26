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
    <section className="flex flex-col items-center justify-center pt-20 pb-12 px-4">
      <div className="w-full max-w-2xl bg-[#1A1D26] border border-gray-700 rounded-lg p-8 shadow-xl">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Instrument Symbol */}
          <div>
            <h3 className="text-white font-semibold mb-2 text-left">Instrument Symbol:</h3>
            <FormInput
              label="e.g., RELIANCE-EQ, NIFTY25JUL22000CE"
              name="instrumentSymbol"
              value={formData.instrumentSymbol}
              onChange={handleInputChange}
              className="rounded-md bg-[#0B0E14]"
            />
            <div className="mt-2 text-left">
              <a 
                href="#" 
                className="text-blue-400 hover:text-blue-300 text-sm inline-flex items-center gap-1"
              >
                <span className="text-red-500">📍</span>
                View accepted symbol formats
              </a>
            </div>
          </div>

          {/* Timeframe */}
          <div>
            <h3 className="text-white font-semibold mb-2 text-left">Timeframe:</h3>
            <Select
              label="Select Timeframe"
              name="timeframe"
              options={timeframeOptions}
              value={formData.timeframe}
              onChange={handleInputChange}
              className="rounded-md bg-[#0B0E14]"
            />
          </div>

          {/* Data Time */}
          <div>
            <h3 className="text-white font-semibold mb-2 text-left">
              Data Time (optional, YYYY-MM-DD HH:MM IST):
            </h3>
            <FormInput
              label="e.g., 2025-07-29 12:00"
              name="dataTime"
              value={formData.dataTime}
              onChange={handleInputChange}
              className="rounded-md bg-[#0B0E14]"
            />
            <p className="mt-2 text-sm text-gray-400 text-left">
              Data Time is optional, defaults to current time (market close if after 15:30 in IST).
            </p>
          </div>

          {/* Select Data to Fetch */}
          <div>
            <h3 className="text-white font-semibold mb-3 text-left">Select Data to Fetch</h3>
            <div className="space-y-3 bg-[#0B0E14] border border-gray-700 rounded-md p-4">
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
              variant="primary"
              className="w-full py-3 text-base font-semibold"
            >
              📊 Submit
            </Button>
          </div>
        </form>
      </div>
    </section>
  );
};

export default Hero;
