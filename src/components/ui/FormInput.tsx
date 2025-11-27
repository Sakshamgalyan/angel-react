import React, { useState } from 'react';

interface FormInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
}

export const FormInput: React.FC<FormInputProps> = ({ label, error, className = '', ...props }) => {
  const [isFocused, setIsFocused] = useState(false);
  const hasValue = props.value && props.value.toString().length > 0;

  return (
    <div className="w-full relative">
      <div className="relative">
        <input
          {...props}
          onFocus={(e) => {
            setIsFocused(true);
            props.onFocus?.(e);
          }}
          onBlur={(e) => {
            setIsFocused(false);
            props.onBlur?.(e);
          }}
          className={`
            peer w-full px-4 py-3 rounded-xl
            bg-gray-50 dark:bg-[#0B0E14]/50
            border-2 border-gray-200 dark:border-gray-700
            text-gray-900 dark:text-white
            placeholder-transparent
            transition-all duration-300
            focus:border-purple-500 dark:focus:border-purple-400
            focus:ring-4 focus:ring-purple-500/10
            focus:bg-white dark:focus:bg-[#1E2329]/50
            ${className}
          `}
          placeholder={label}
        />
        <label
          htmlFor={props.id || props.name}
          className={`
            absolute left-4 transition-all duration-300 pointer-events-none
            ${isFocused || hasValue
              ? '-top-2.5 text-xs bg-white dark:bg-[#1E2329] px-2 text-purple-600 dark:text-purple-400 font-medium'
              : 'top-3 text-sm text-gray-500 dark:text-gray-400'
            }
          `}
        >
          {label}
        </label>
      </div>
      {error && (
        <p className="mt-1.5 text-xs text-red-600 dark:text-red-400 flex items-center gap-1 animate-slide-in-down">
          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          {error}
        </p>
      )}
    </div>
  );
};
