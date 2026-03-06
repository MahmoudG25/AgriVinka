import React, { forwardRef, useId } from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

const cn = (...inputs) => twMerge(clsx(inputs));

/**
 * Native <select> wrapper with consistent styling.
 *
 * @example
 * <Select label="الفئة" options={[{value:'a', label:'أ'}, {value:'b', label:'ب'}]} />
 */
const Select = forwardRef(({
  label,
  error,
  helperText,
  options = [],
  placeholder,
  className,
  wrapperClassName,
  ...props
}, ref) => {
  const autoId = useId();
  const selectId = props.id || autoId;
  const errorId = error ? `${selectId}-error` : undefined;

  return (
    <div className={cn('flex flex-col gap-1.5', wrapperClassName)}>
      {label && (
        <label
          htmlFor={selectId}
          className="text-sm font-bold text-heading-dark"
        >
          {label}
        </label>
      )}

      <div className="relative">
        <select
          ref={ref}
          id={selectId}
          aria-invalid={!!error}
          aria-describedby={errorId}
          className={cn(
            'w-full h-10 px-4 pe-10 text-sm font-medium rounded-xl border bg-background text-heading-dark appearance-none cursor-pointer',
            'transition-all duration-200',
            'focus:outline-none focus:ring-2 focus:ring-ring/50 focus:ring-offset-1 focus:border-primary',
            error
              ? 'border-danger focus:ring-danger/30'
              : 'border-border hover:border-primary/40',
            'disabled:opacity-50 disabled:cursor-not-allowed',
            className,
          )}
          {...props}
        >
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>

        {/* Chevron icon */}
        <span className="absolute top-1/2 -translate-y-1/2 end-3 pointer-events-none text-muted">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="stroke-current">
            <path d="M4 6l4 4 4-4" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </span>
      </div>

      {error && (
        <p id={errorId} className="text-xs font-medium text-danger" role="alert">
          {error}
        </p>
      )}
      {!error && helperText && (
        <p className="text-xs font-medium text-muted">{helperText}</p>
      )}
    </div>
  );
});

Select.displayName = 'Select';
export default Select;
