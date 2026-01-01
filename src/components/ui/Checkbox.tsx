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
            border-2 border-gray-300
            rounded-md
            bg-gray-50
            transition-all duration-300
            checked:bg-blue-500 checked:border-blue-500
            focus:ring-2 focus:ring-blue-500/50
            hover:border-blue-400
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
      <span className="text-sm font-medium text-gray-700 group-hover:text-gray-900 transition-colors">
        {label}
      </span>
    </label>
  );
};
