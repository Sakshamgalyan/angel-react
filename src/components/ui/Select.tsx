import React from 'react';

interface SelectOption {
  value: string;
  label: string;
}

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  options: SelectOption[];
  error?: string;
}

export const Select: React.FC<SelectProps> = ({ 
  label, 
  options, 
  error, 
  className = '', 
  ...props 
}) => {
  return (
    <div className="w-full relative">
      <label htmlFor={props.id || props.name} className="sr-only">
        {label}
      </label>
      <div className="relative">
        <select
          {...props}
          className={`
            w-full px-4 py-3 rounded-xl
            bg-gray-50 dark:bg-[#0B0E14]/50
            border-2 border-gray-200 dark:border-gray-700
            text-gray-900 dark:text-white
            transition-all duration-300
            focus:border-purple-500 dark:focus:border-purple-400
            focus:ring-4 focus:ring-purple-500/10
            focus:bg-white dark:focus:bg-[#1E2329]/50
            cursor-pointer
            appearance-none
            ${className}
          `}
        >
          <option value="" disabled>
            {label}
          </option>
          {options.map((option) => (
            <option 
              key={option.value} 
              value={option.value}
              className="bg-white dark:bg-[#1E2329] text-gray-900 dark:text-white"
            >
              {option.label}
            </option>
          ))}
        </select>
        {/* Custom dropdown arrow */}
        <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
          <svg className="w-5 h-5 text-gray-500 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>
      {error && (
        <p className="mt-1.5 text-xs text-red-600 dark:text-red-400 flex items-center gap-1">
          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          {error}
        </p>
      )}
    </div>
  );
};
