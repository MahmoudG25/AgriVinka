import React, { forwardRef, useId } from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

const cn = (...inputs) => twMerge(clsx(inputs));

/**
 * Input primitive — label, error state, helper text, optional icon.
 *
 * @example
 * <Input label="البريد الإلكتروني" placeholder="you@example.com" />
 * <Input label="الاسم" error="هذا الحقل مطلوب" />
 * <Input label="بحث" icon={<FiSearch />} />
 */
const Input = forwardRef(({
  label,
  error,
  helperText,
  icon,
  className,
  wrapperClassName,
  ...props
}, ref) => {
  const autoId = useId();
  const inputId = props.id || autoId;
  const errorId = error ? `${inputId}-error` : undefined;
  const helperId = helperText ? `${inputId}-helper` : undefined;
  const describedBy = [errorId, helperId].filter(Boolean).join(' ') || undefined;

  return (
    <div className={cn('flex flex-col gap-1.5', wrapperClassName)}>
      {label && (
        <label
          htmlFor={inputId}
          className="text-sm font-bold text-heading-dark dark:text-heading-dark"
        >
          {label}
        </label>
      )}

      <div className="relative">
        {icon && (
          <span className="absolute top-1/2 -translate-y-1/2 start-3 text-muted pointer-events-none">
            {icon}
          </span>
        )}

        <input
          ref={ref}
          id={inputId}
          aria-invalid={!!error}
          aria-describedby={describedBy}
          className={cn(
            'w-full h-10 px-4 text-sm font-medium rounded-xl border bg-background text-heading-dark placeholder:text-muted/60',
            'transition-all duration-200',
            'focus:outline-none focus:ring-2 focus:ring-ring/50 focus:ring-offset-1 focus:border-primary',
            icon && 'ps-10',
            error
              ? 'border-danger focus:ring-danger/30'
              : 'border-border hover:border-primary/40',
            'disabled:opacity-50 disabled:cursor-not-allowed',
            className,
          )}
          {...props}
        />
      </div>

      {error && (
        <p id={errorId} className="text-xs font-medium text-danger" role="alert">
          {error}
        </p>
      )}
      {!error && helperText && (
        <p id={helperId} className="text-xs font-medium text-muted">
          {helperText}
        </p>
      )}
    </div>
  );
});

Input.displayName = 'Input';
export default Input;
