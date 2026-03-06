import React, { forwardRef } from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * cn() — merge Tailwind classes safely (dedupes conflicts).
 * This is the standard pattern from shadcn/ui.
 */
const cn = (...inputs) => twMerge(clsx(inputs));

/* ─── Variant Maps ─── */
const variants = {
  primary: 'bg-primary text-primary-foreground shadow-sm hover:bg-primary-hover hover:shadow-md active:scale-[0.98]',
  secondary: 'bg-heading-dark text-white shadow-sm hover:bg-[#111e11] hover:shadow-md active:scale-[0.98]',
  accent: 'bg-accent text-accent-foreground shadow-sm hover:bg-accent-hover hover:shadow-md active:scale-[0.98]',
  ghost: 'bg-transparent text-heading-dark hover:bg-heading-dark/5 active:bg-heading-dark/10',
  outline: 'border border-border text-heading-dark bg-transparent hover:bg-background-alt active:bg-heading-dark/5',
  danger: 'bg-danger text-white shadow-sm hover:bg-[#c03e3e] hover:shadow-md active:scale-[0.98]',
  link: 'text-primary underline-offset-4 hover:underline bg-transparent p-0 h-auto shadow-none',
};

const sizes = {
  sm: 'h-8 px-3 text-xs gap-1.5 rounded-lg',
  md: 'h-10 px-5 text-sm gap-2 rounded-xl',
  lg: 'h-12 px-8 text-base gap-2.5 rounded-xl',
  xl: 'h-14 px-10 text-lg gap-3 rounded-2xl',
};

/**
 * Button primitive with variant-driven styling.
 *
 * @example
 * <Button variant="primary" size="md">Save</Button>
 * <Button variant="ghost" size="sm" icon={<FiPlus />}>Add</Button>
 * <Button variant="primary" loading>Saving…</Button>
 */
const Button = forwardRef(({
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  icon,
  iconPosition = 'start',
  className,
  children,
  ...props
}, ref) => {
  const isDisabled = disabled || loading;

  return (
    <button
      ref={ref}
      disabled={isDisabled}
      className={cn(
        'inline-flex items-center justify-center font-bold transition-all cursor-pointer select-none',
        'focus-visible:ring-2 focus-visible:ring-ring/50 focus-visible:ring-offset-2 focus-visible:outline-none',
        'disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none',
        variants[variant],
        sizes[size],
        className,
      )}
      {...props}
    >
      {loading && (
        <svg className="animate-spin h-4 w-4 shrink-0" viewBox="0 0 24 24" fill="none">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
        </svg>
      )}
      {!loading && icon && iconPosition === 'start' && (
        <span className="shrink-0">{icon}</span>
      )}
      {children && <span>{children}</span>}
      {!loading && icon && iconPosition === 'end' && (
        <span className="shrink-0">{icon}</span>
      )}
    </button>
  );
});

Button.displayName = 'Button';
export default Button;
