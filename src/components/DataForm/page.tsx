"use client";

import React, { useState } from 'react';

export type FormDataShape = {
  symbol: string;
  timeframe: string;
  data_time?: string;
  technicals: string;
  fundamentals: string;
  news: string;
  peers: string;
};

type DataFormProps = {
  onSubmit: (data: FormDataShape) => void;
  loading?: boolean;
};

function DataForm({ onSubmit, loading = false }: DataFormProps) {
  const [symbol, setSymbol] = useState('');
  const [timeframe, setTimeframe] = useState('');
  const [dataTime, setDataTime] = useState('');
  const [technicals, setTechnicals] = useState(false);
  const [fundamentals, setFundamentals] = useState(false);
  const [news, setNews] = useState(false);
  const [peers, setPeers] = useState(false);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Validate data_time format
    if (dataTime && !/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}$/.test(dataTime)) {
      alert('Error: Invalid Data Time format (use YYYY-MM-DD HH:MM IST)');
      return;
    }

    const formData = {
      symbol: symbol.trim().toUpperCase(),
      timeframe,
      data_time: dataTime,
      technicals: technicals ? 'True' : 'False',
      fundamentals: fundamentals ? 'True' : 'False',
      news: news ? 'True' : 'False',
      peers: peers ? 'True' : 'False'
    };

    onSubmit(formData);
  };

  return (
    <form id="dataForm" onSubmit={handleSubmit} className="w-full glass-card rounded-2xl p-4 sm:p-6 md:p-8 animate-fade-in">
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 lg:gap-8">
        <div className="space-y-6">
          <div className="relative group">
            <label htmlFor="symbol" className="block text-sm font-medium text-muted-foreground mb-2 group-focus-within:text-primary transition-colors">Instrument Symbol <span className="text-red-500">*</span></label>
            <input
              type="text"
              id="symbol"
              name="symbol"
              required
              placeholder="e.g., RELIANCE-EQ"
              value={symbol}
              onChange={(e) => setSymbol(e.target.value)}
              disabled={loading}
              className="w-full px-4 py-3 rounded-xl bg-background border border-input focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200 outline-none font-medium"
            />
          </div>

          <div className="relative group">
            <label htmlFor="timeframe" className="block text-sm font-medium text-muted-foreground mb-2 group-focus-within:text-primary transition-colors">Timeframe <span className="text-red-500">*</span></label>
            <div className="relative">
              <select 
                id="timeframe" 
                name="timeframe" 
                required 
                value={timeframe} 
                onChange={(e) => setTimeframe(e.target.value)} 
                disabled={loading}
                className="w-full px-4 py-3 rounded-xl bg-background border border-input focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200 outline-none font-medium appearance-none"
              >
                <option value="">Select Timeframe</option>
                <option value="1min">1 Minute</option>
                <option value="3min">3 Minutes</option>
                <option value="5min">5 Minutes</option>
                <option value="10min">10 Minutes</option>
                <option value="15min">15 Minutes</option>
                <option value="30min">30 Minutes</option>
                <option value="1hr">1 Hour</option>
                <option value="1day">1 Day</option>
              </select>
              <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-muted-foreground">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="m6 9 6 6 6-6"/>
                </svg>
              </div>
            </div>
          </div>

          <div className="relative group">
            <label htmlFor="data_time" className="block text-sm font-medium text-muted-foreground mb-2 group-focus-within:text-primary transition-colors">Data Time (optional)</label>
            <input
              type="text"
              id="data_time"
              name="data_time"
              placeholder="YYYY-MM-DD HH:MM (IST)"
              value={dataTime}
              onChange={(e) => setDataTime(e.target.value)}
              disabled={loading}
              className="w-full px-4 py-3 rounded-xl bg-background border border-input focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200 outline-none font-medium"
            />
            <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
              <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="12" y1="16" x2="12" y2="12"></line>
                <line x1="12" y1="8" x2="12.01" y2="8"></line>
              </svg>
              Defaults to current time or market close if after 15:30 IST
            </p>
          </div>
        </div>

        <div className="flex flex-col h-full">
          <fieldset disabled={loading} className="h-full border border-border rounded-xl p-6 bg-secondary/20">
            <legend className="px-2 text-sm font-semibold text-foreground flex items-center gap-2">
              <span className="bg-primary/10 text-primary p-1 rounded">📊</span> 
              Select Data to Fetch
            </legend>
            
            <div className="grid grid-cols-1 gap-4 mt-2">
              {[
                { id: 'technicals', label: 'Technical Indicators', state: technicals, setter: setTechnicals, icon: '📈' },
                { id: 'fundamentals', label: 'Fundamentals', state: fundamentals, setter: setFundamentals, icon: '🏢' },
                { id: 'news', label: 'News & Sentiment', state: news, setter: setNews, icon: '📰' },
                { id: 'peers', label: 'Peer/Beta Analysis', state: peers, setter: setPeers, icon: '👥' }
              ].map((item) => (
                <label 
                  key={item.id}
                  className={`flex items-center p-4 rounded-xl border transition-all duration-200 cursor-pointer ${
                    item.state 
                      ? 'bg-primary/5 border-primary/50 shadow-sm' 
                      : 'bg-background border-border hover:border-primary/30 hover:bg-secondary/50'
                  }`}
                >
                  <div className="relative flex items-center justify-center w-5 h-5 mr-4">
                    <input 
                      type="checkbox" 
                      name={item.id} 
                      checked={item.state} 
                      onChange={(e) => item.setter(e.target.checked)}
                      className="peer appearance-none w-5 h-5 border-2 border-muted-foreground rounded checked:bg-primary checked:border-primary transition-colors"
                    />
                    <svg className="absolute w-3.5 h-3.5 text-white opacity-0 peer-checked:opacity-100 transition-opacity pointer-events-none" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                  </div>
                  <span className="flex-1 font-medium text-foreground">{item.label}</span>
                  <span className="text-lg opacity-70">{item.icon}</span>
                </label>
              ))}
            </div>
          </fieldset>
        </div>
      </div>

      <div className="mt-8 flex justify-end">
        <button 
          type="submit" 
          disabled={loading} 
          className="relative overflow-hidden group px-8 py-3 rounded-xl bg-primary text-primary-foreground font-semibold shadow-lg shadow-primary/25 hover:shadow-primary/40 hover:-translate-y-0.5 transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:shadow-none"
        >
          <span className="relative z-10 flex items-center gap-2">
            {loading ? (
              <>
                <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Processing...
              </>
            ) : (
              <>
                <span>Fetch Analysis</span>
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="group-hover:translate-x-1 transition-transform">
                  <line x1="5" y1="12" x2="19" y2="12"></line>
                  <polyline points="12 5 19 12 12 19"></polyline>
                </svg>
              </>
            )}
          </span>
          <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
        </button>
      </div>
    </form>
  );
}

export default DataForm;
