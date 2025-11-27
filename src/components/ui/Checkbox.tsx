import React from 'react';

interface CheckboxProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
}

export const Checkbox: React.FC<CheckboxProps> = ({ label, className, ...props }) => {
  return (
    <label className={`flex items-start gap-3 cursor-pointer group ${className}`}>
      <div className="relative flex items-center justify-center mt-0.5">
        <input 
          type="checkbox" 
          className="
            peer w-5 h-5 cursor-pointer
            appearance-none
            border-2 border-gray-300 dark:border-gray-600
            rounded-md
            bg-gray-50 dark:bg-[#0B0E14]
            transition-all duration-300
            checked:bg-purple-600 checked:border-purple-600
            dark:checked:bg-purple-500 dark:checked:border-purple-500
            focus:ring-2 focus:ring-purple-500/50
            hover:border-purple-400 dark:hover:border-purple-400
            active:scale-95
          "
          {...props}
        />
        <svg 
          className="
            absolute w-3 h-3 text-white
            pointer-events-none
            opacity-0 peer-checked:opacity-100
            transition-opacity duration-300
          "
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
        </svg>
      </div>
      <span className="text-sm font-medium text-gray-700 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-white transition-colors">
        {label}
      </span>
    </label>
  );
};
