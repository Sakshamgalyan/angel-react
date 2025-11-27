"use client";

import React, { useState, useMemo, useCallback } from 'react';
import Input from '../Input/Input';
import Select from '../Select/Select';
import Checkbox from '../Checkbox/Checkbox';
import Button from '../Button/Button';
import Icon from '../Icon/Icon';
import type { FormDataShape } from '@/types/types';

type DataFormProps = {
  onSubmit: (data: FormDataShape) => void;
  loading?: boolean;
};

const DataForm = React.memo(({ onSubmit, loading = false }: DataFormProps) => {
  const [symbol, setSymbol] = useState('');
  const [timeframe, setTimeframe] = useState('');
  const [dataTime, setDataTime] = useState('');
  const [technicals, setTechnicals] = useState(false);
  const [fundamentals, setFundamentals] = useState(false);
  const [news, setNews] = useState(false);
  const [peers, setPeers] = useState(false);

  const timeframeOptions = useMemo(() => [
    { value: '1min', label: '1 Minute' },
    { value: '3min', label: '3 Minutes' },
    { value: '5min', label: '5 Minutes' },
    { value: '10min', label: '10 Minutes' },
    { value: '15min', label: '15 Minutes' },
    { value: '30min', label: '30 Minutes' },
    { value: '1hr', label: '1 Hour' },
    { value: '1day', label: '1 Day' },
  ], []);

  const checkboxOptions = useMemo(() => [
    { id: 'technicals', label: 'Technical Indicators', state: technicals, setter: setTechnicals, icon: '📈' },
    { id: 'fundamentals', label: 'Fundamentals', state: fundamentals, setter: setFundamentals, icon: '🏢' },
    { id: 'news', label: 'News & Sentiment', state: news, setter: setNews, icon: '📰' },
    { id: 'peers', label: 'Peer/Beta Analysis', state: peers, setter: setPeers, icon: '👥' }
  ], [technicals, fundamentals, news, peers]);

  const handleSubmit = useCallback((e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Validate data_time format
    if (dataTime && !/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}$/.test(dataTime)) {
      alert('Error: Invalid Data Time format (use YYYY-MM-DD HH:MM IST)');
      return;
    }

    const formData: FormDataShape = {
      symbol: symbol.trim().toUpperCase(),
      timeframe,
      data_time: dataTime,
      technicals: technicals ? 'True' : 'False',
      fundamentals: fundamentals ? 'True' : 'False',
      news: news ? 'True' : 'False',
      peers: peers ? 'True' : 'False'
    };

    onSubmit(formData);
  }, [symbol, timeframe, dataTime, technicals, fundamentals, news, peers, onSubmit]);

  return (
    <form id="dataForm" onSubmit={handleSubmit} className="w-full glass-card rounded-2xl p-4 sm:p-6 md:p-8 animate-fade-in">
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 lg:gap-8">
        <div className="space-y-6">
          <Input
            id="symbol"
            name="symbol"
            label="Instrument Symbol"
            placeholder="e.g., RELIANCE-EQ"
            value={symbol}
            onChange={setSymbol}
            required
            disabled={loading}
          />

          <Select
            id="timeframe"
            name="timeframe"
            label="Timeframe"
            options={timeframeOptions}
            value={timeframe}
            onChange={setTimeframe}
            required
            disabled={loading}
            placeholder="Select Timeframe"
          />

          <Input
            id="data_time"
            name="data_time"
            label="Data Time (optional)"
            placeholder="YYYY-MM-DD HH:MM (IST)"
            value={dataTime}
            onChange={setDataTime}
            disabled={loading}
            helperText="Defaults to current time or market close if after 15:30 IST"
          />
        </div>

        <div className="flex flex-col h-full">
          <fieldset disabled={loading} className="h-full border border-border rounded-xl p-6 bg-secondary/20">
            <legend className="px-2 text-sm font-semibold text-foreground flex items-center gap-2">
              <span className="bg-primary/10 text-primary p-1 rounded">📊</span> 
              Select Data to Fetch
            </legend>
            
            <div className="grid grid-cols-1 gap-4 mt-2">
              {checkboxOptions.map((item) => (
                <Checkbox
                  key={item.id}
                  id={item.id}
                  name={item.id}
                  label={item.label}
                  checked={item.state}
                  onChange={item.setter}
                  disabled={loading}
                  icon={item.icon}
                />
              ))}
            </div>
          </fieldset>
        </div>
      </div>

      <div className="mt-8 flex justify-end">
        <Button type="submit" loading={loading} disabled={loading}>
          <span>Fetch Analysis</span>
          <Icon name="arrow-right" size={18} className="group-hover:translate-x-1 transition-transform" />
        </Button>
      </div>
    </form>
  );
});

DataForm.displayName = 'DataForm';

export default DataForm;
