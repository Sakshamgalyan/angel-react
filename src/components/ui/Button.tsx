'use client';

import clsx from 'clsx';
import { forwardRef } from 'react';

export type ButtonVariant = 'primary' | 'outline' | 'ghost';

interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  isLoading?: boolean;
}

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    'bg-blue-600 text-white hover:bg-blue-700',
  outline:
    'border border-blue-600 text-blue-600 hover:bg-blue-50',
  ghost:
    'text-blue-600 hover:bg-blue-100',
};

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      children,
      variant = 'primary',
      isLoading = false,
      disabled,
      className,
      ...props
    },
    ref
  ) => {
    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={clsx(
          'inline-flex items-center justify-center px-4 py-2 rounded-lg text-sm font-medium transition',
          variantClasses[variant],
          (disabled || isLoading) &&
            'opacity-50 cursor-not-allowed',
          className
        )}
        {...props}
      >
        {isLoading ? 'Loading...' : children}
      </button>
    );
  }
);

Button.displayName = 'Button';

export default Button;
