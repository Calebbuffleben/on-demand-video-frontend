import React, { ButtonHTMLAttributes } from 'react';
import clsx from 'clsx';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'danger' | 'ghost';
  size?: 'xs' | 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  children: React.ReactNode;
}

const Button: React.FC<ButtonProps> = ({
  children,
  className,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  disabled,
  ...props
}) => {
  const baseStyles = "inline-flex items-center justify-center font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors";
  
  const variantStyles = {
    primary: "bg-scale-900 text-white hover:bg-scale-800 focus:ring-scale-700",
    secondary: "bg-silver-100 text-scale-700 hover:bg-silver-200 focus:ring-silver-500",
    outline: "bg-white text-scale-700 border border-silver-300 hover:bg-silver-50 focus:ring-scale-500",
    danger: "bg-red-600 text-white hover:bg-red-700 focus:ring-red-500",
    ghost: "bg-transparent text-scale-700 hover:bg-silver-100 focus:ring-silver-500",
  };
  
  const sizeStyles = {
    xs: "px-2 py-1 text-xs",
    sm: "px-3 py-1.5 text-sm",
    md: "px-4 py-2 text-sm",
    lg: "px-5 py-2.5 text-base",
  };
  
  const loadingStyles = isLoading ? "opacity-70 cursor-not-allowed" : "";
  const disabledStyles = disabled ? "opacity-50 cursor-not-allowed" : "";
  
  const buttonStyles = clsx(
    baseStyles,
    variantStyles[variant],
    sizeStyles[size],
    loadingStyles,
    disabledStyles,
    className
  );
  
  return (
    <button
      className={buttonStyles}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading && (
        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      )}
      {children}
    </button>
  );
};

export default Button; 