"use client";

import React from 'react';
import Icon from '../Icon/Icon';

type SelectOption = {
  value: string;
  label: string;
};

type SelectProps = {
  id: string;
  name: string;
  label: string;
  options: SelectOption[];
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
  disabled?: boolean;
  placeholder?: string;
  className?: string;
};

const Select = React.memo(({
  id,
  name,
  label,
  options,
  value,
  onChange,
  required = false,
  disabled = false,
  placeholder = 'Select an option',
  className = '',
}: SelectProps) => {
  return (
    <div className={`relative group ${className}`}>
      <label 
        htmlFor={id} 
        className="block text-sm font-medium text-muted-foreground mb-2 group-focus-within:text-primary transition-colors"
      >
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <div className="relative">
        <select
          id={id}
          name={name}
          required={required}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
          className="w-full px-4 py-3 rounded-xl bg-background border border-input focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200 outline-none font-medium appearance-none"
        >
          <option value="">{placeholder}</option>
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-muted-foreground">
          <Icon name="chevron-down" size={16} />
        </div>
      </div>
    </div>
  );
});

Select.displayName = 'Select';

export default Select;
