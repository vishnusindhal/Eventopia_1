import React from 'react';

export const Card = ({ children, className = '', hoverable = false, ...props }) => {
  const baseStyles = 'bg-surface dark:bg-surface-dark border border-border dark:border-border-dark rounded-xl overflow-hidden';
  const hoverStyles = hoverable ? 'transition-all hover:shadow-md hover:border-slate-300 dark:hover:border-slate-600' : '';
  
  return (
    <div className={`${baseStyles} ${hoverStyles} ${className}`} {...props}>
      {children}
    </div>
  );
};
