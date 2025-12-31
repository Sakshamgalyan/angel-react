'use client';

import clsx from 'clsx';
import { forwardRef } from 'react';

export type InputVariant = 'default' | 'outline' | 'filled';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  variant?: InputVariant;
  error?: string;
}

const variantClasses: Record<InputVariant, string> = {
  default:
    'border border-gray-300 focus:ring-1 focus:ring-black',
  outline:
    'border-2 border-gray-400 focus:border-black',
  filled:
    'bg-gray-100 border border-transparent focus:border-black',
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
      ...props
    },
    ref
  ) => {
    return (
      <div className="w-full space-y-1">
        {label && (
          <label className="text-sm text-gray-700">{label}</label>
        )}

        <input
          ref={ref}
          type={type}
          onChange={onChange}
          onFocus={onFocus}
          onBlur={onBlur}
          className={clsx(
            'w-full mt-1 px-4 py-2 rounded-lg outline-none transition',
            variantClasses[variant],
            error && 'border-red-500 focus:ring-red-500',
            className
          )}
          {...props}
        />

        {error && (
          <p className="text-xs text-red-500 mt-1">{error}</p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

export default Input;
