import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'outline' | 'secondary' | 'gradient';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  children,
  className = '',
  ...props
}) => {
  const baseStyles = `
    font-semibold rounded-xl 
    focus:outline-none focus:ring-2 focus:ring-offset-2 
    transition-all duration-300 
    disabled:opacity-50 disabled:cursor-not-allowed
    transform active:scale-95
    relative overflow-hidden
  `;

  const variantStyles = {
    primary: `
      bg-[var(--primary)] hover:brightness-110
      text-white 
      focus:ring-[var(--primary)]
      shadow-lg hover:shadow-xl hover:-translate-y-0.5
    `,
    outline: `
      border-2 border-[var(--primary)]
      bg-transparent 
      hover:bg-[var(--primary)]/10
      text-[var(--primary)]
      focus:ring-[var(--primary)]
    `,
    secondary: `
      bg-gray-100 hover:bg-gray-200 
      dark:bg-gray-800 dark:hover:bg-gray-700
      text-gray-900 dark:text-white 
      focus:ring-gray-500
      shadow-md hover:shadow-lg
    `,
    gradient: `
      bg-gradient-to-r from-[var(--primary)] to-indigo-600
      text-white 
      focus:ring-[var(--primary)]
      shadow-lg hover:shadow-xl
      hover:scale-[1.02]
    `,
  };

  const sizeStyles = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-6 py-3 text-base',
    lg: 'px-8 py-4 text-lg',
  };

  const gradientStyle = {};

  return (
    <button
      className={`${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
      style={gradientStyle}
      {...props}
    >
      {variant === 'gradient' && (
        <span className="absolute inset-0 bg-gradient-to-r from-blue-600 to-indigo-600 opacity-0 hover:opacity-100 transition-opacity duration-300" />
      )}
      <span className="relative z-10">{children}</span>
    </button>
  );
};
