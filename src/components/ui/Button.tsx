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
      bg-purple-600 hover:bg-purple-700 
      dark:bg-purple-500 dark:hover:bg-purple-600
      text-white 
      focus:ring-purple-500
      shadow-lg hover:shadow-xl
    `,
    outline: `
      border-2 border-purple-600 dark:border-purple-400
      bg-transparent 
      hover:bg-purple-50 dark:hover:bg-purple-900/20
      text-purple-600 dark:text-purple-400
      focus:ring-purple-500
    `,
    secondary: `
      bg-gray-200 hover:bg-gray-300 
      dark:bg-gray-700 dark:hover:bg-gray-600 
      text-gray-900 dark:text-white 
      focus:ring-gray-500
      shadow-md hover:shadow-lg
    `,
    gradient: `
      text-white 
      focus:ring-purple-500
      shadow-lg hover:shadow-xl
      hover:scale-[1.02]
    `,
  };
  
  const sizeStyles = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-6 py-3 text-base',
    lg: 'px-8 py-4 text-lg',
  };
  
  const gradientStyle = variant === 'gradient' ? {
    background: 'var(--gradient-primary)'
  } : {};
  
  return (
    <button
      className={`${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
      style={gradientStyle}
      {...props}
    >
      {variant === 'gradient' && (
        <span className="absolute inset-0 bg-gradient-to-r from-purple-600 to-blue-600 opacity-0 hover:opacity-100 transition-opacity duration-300" />
      )}
      <span className="relative z-10">{children}</span>
    </button>
  );
};
