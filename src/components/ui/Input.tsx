'use client';

import clsx from 'clsx';
import { forwardRef } from 'react';

export type InputVariant = 'default' | 'outline' | 'filled';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  variant?: InputVariant;
  error?: string;
  endIcon?: React.ReactNode;
  helperText?: string;
}

const variantClasses: Record<InputVariant, string> = {
  default:
    'border border-gray-300 dark:border-gray-700 focus:ring-1 focus:ring-black dark:focus:ring-white',
  outline:
    'border-2 border-gray-400 dark:border-gray-600 focus:border-black dark:focus:border-white',
  filled:
    'bg-gray-100 dark:bg-gray-800 border border-transparent focus:border-black dark:focus:border-white',
};

const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      variant = 'default',
      type = 'text',
      error,
      onChange,
      onFocus,
      onBlur,
      className,
      endIcon,
      helperText,
      ...props
    },
    ref
  ) => {
    return (
      <div className="w-full space-y-1.5">
        {label && (
          <label className="text-sm font-medium text-gray-700">{label}</label>
        )}

        <div className="relative">
          <input
            ref={ref}
            type={type}
            onChange={onChange}
            onFocus={onFocus}
            onBlur={onBlur}
            className={clsx(
              'w-full px-4 py-2 rounded-lg outline-none transition-colors duration-200',
              'text-zinc-900 placeholder:text-zinc-500',
              variantClasses[variant],
              error && 'border-red-500 focus:ring-red-500',
              endIcon && 'pr-10',
              className
            )}
            {...props}
          />
          {endIcon && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
              {endIcon}
            </div>
          )}
        </div>

        {helperText && !error && (
          <p className="text-xs text-gray-500">{helperText}</p>
        )}

        {error && (
          <p className="text-xs text-red-500 mt-1">{error}</p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

export default Input;
