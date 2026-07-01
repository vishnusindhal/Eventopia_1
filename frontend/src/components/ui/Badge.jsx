import React from 'react';

const variants = {
  default: 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300',
  primary: 'bg-primary-light text-primary-hover dark:bg-primary/20 dark:text-primary-light',
  success: 'bg-success-light text-success-hover dark:bg-success/20 dark:text-success-light',
  warning: 'bg-warning-light text-warning-hover dark:bg-warning/20 dark:text-warning-light',
  danger: 'bg-danger-light text-danger-hover dark:bg-danger/20 dark:text-danger-light'
};

export const Badge = ({ children, variant = 'default', className = '' }) => {
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${variants[variant]} ${className}`}>
      {children}
    </span>
  );
};
