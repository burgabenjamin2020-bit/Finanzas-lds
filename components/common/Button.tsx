import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'dark-ghost';
}

const Button: React.FC<ButtonProps> = ({ children, className = '', variant = 'primary', ...props }) => {
  const baseClasses = 'inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-background dark:focus:ring-offset-dark-background transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed';
  
  const variantClasses = {
    primary: 'text-white bg-primary hover:bg-primary-hover focus:ring-primary-light',
    secondary: 'text-text-secondary bg-slate-100 hover:bg-slate-200 dark:bg-dark-surface/80 dark:text-dark-text-secondary dark:hover:bg-dark-border focus:ring-slate-500',
    'dark-ghost': 'text-text-secondary bg-slate-500/10 hover:bg-slate-500/20 dark:text-dark-text-secondary dark:bg-dark-border/20 dark:hover:bg-dark-border/50 focus:ring-slate-500',
  };

  return (
    <button
      className={`${baseClasses} ${variantClasses[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;
