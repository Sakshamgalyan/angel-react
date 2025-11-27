"use client";

import React from 'react';
import Icon from '../Icon/Icon';

type InputProps = {
  id: string;
  name: string;
  label: string;
  type?: 'text' | 'email' | 'password' | 'number';
  placeholder?: string;
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
  disabled?: boolean;
  helperText?: string;
  className?: string;
};

const Input = React.memo(({
  id,
  name,
  label,
  type = 'text',
  placeholder,
  value,
  onChange,
  required = false,
  disabled = false,
  helperText,
  className = '',
}: InputProps) => {
  return (
    <div className={`relative group ${className}`}>
      <label 
        htmlFor={id} 
        className="block text-sm font-medium text-muted-foreground mb-2 group-focus-within:text-primary transition-colors"
      >
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <input
        type={type}
        id={id}
        name={name}
        required={required}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        className="w-full px-4 py-3 rounded-xl bg-background border border-input focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200 outline-none font-medium"
      />
      {helperText && (
        <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
          <Icon name="info" size={12} />
          {helperText}
        </p>
      )}
    </div>
  );
});

Input.displayName = 'Input';

export default Input;
