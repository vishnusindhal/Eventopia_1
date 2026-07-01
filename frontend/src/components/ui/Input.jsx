import React from 'react';

export const Input = React.forwardRef(({
  label,
  error,
  className = '',
  ...props
}, ref) => {
  const baseInputStyles = 'w-full rounded-md border bg-surface dark:bg-surface-dark px-3 py-2 text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary disabled:cursor-not-allowed disabled:opacity-50 transition-colors';
  const borderStyles = error ? 'border-danger focus:ring-danger focus:border-danger' : 'border-border dark:border-border-dark';

  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
          {label}
        </label>
      )}
      <input
        ref={ref}
        className={`${baseInputStyles} ${borderStyles} ${className}`}
        {...props}
      />
      {error && (
        <p className="mt-1.5 text-sm text-danger">
          {error}
        </p>
      )}
    </div>
  );
});

Input.displayName = 'Input';
