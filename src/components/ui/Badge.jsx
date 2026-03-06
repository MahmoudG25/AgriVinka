import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

const cn = (...inputs) => twMerge(clsx(inputs));

const badgeVariants = {
  default: 'bg-heading-dark/10 text-heading-dark',
  primary: 'bg-primary-light text-primary',
  success: 'bg-success-light text-success',
  warning: 'bg-warning-light text-warning',
  danger: 'bg-danger-light text-danger',
  info: 'bg-info-light text-info',
  outline: 'bg-transparent border border-border text-heading-dark',
};

const badgeSizes = {
  sm: 'text-[10px] px-2 py-0.5',
  md: 'text-xs px-2.5 py-1',
};

/**
 * Badge for status labels, tags, and counts.
 *
 * @example
 * <Badge variant="success">مفعّل</Badge>
 * <Badge variant="danger" size="sm">محذوف</Badge>
 */
const Badge = ({
  variant = 'default',
  size = 'md',
  icon,
  className,
  children,
  ...props
}) => (
  <span
    className={cn(
      'inline-flex items-center gap-1 font-bold rounded-full whitespace-nowrap select-none',
      badgeVariants[variant],
      badgeSizes[size],
      className,
    )}
    {...props}
  >
    {icon && <span className="shrink-0">{icon}</span>}
    {children}
  </span>
);

Badge.displayName = 'Badge';
export default Badge;
