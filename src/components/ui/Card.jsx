import React, { forwardRef } from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

const cn = (...inputs) => twMerge(clsx(inputs));

const cardVariants = {
  default: 'bg-surface-white border border-border rounded-card',
  elevated: 'bg-surface-white border border-border rounded-card shadow-md',
  outlined: 'bg-transparent border-2 border-border rounded-card',
  interactive: 'bg-surface-white border border-border rounded-card shadow-sm hover:shadow-lg hover:-translate-y-1 hover:border-primary/20 transition-all duration-300 cursor-pointer',
  flat: 'bg-background-alt border border-transparent rounded-card',
};

const paddings = {
  none: '',
  sm: 'p-4',
  md: 'p-6',
  lg: 'p-8',
};

/**
 * Card primitive with variant-driven styling.
 *
 * @example
 * <Card variant="interactive" padding="md">
 *   <Card.Header>Title</Card.Header>
 *   <Card.Body>Content here</Card.Body>
 * </Card>
 */
const Card = forwardRef(({
  variant = 'default',
  padding = 'md',
  className,
  children,
  ...props
}, ref) => (
  <div
    ref={ref}
    className={cn(
      cardVariants[variant],
      paddings[padding],
      className,
    )}
    {...props}
  >
    {children}
  </div>
));

Card.displayName = 'Card';

/* ─── Sub-components ─── */
const CardHeader = ({ className, children, ...props }) => (
  <div className={cn('mb-4', className)} {...props}>
    {children}
  </div>
);
CardHeader.displayName = 'Card.Header';

const CardBody = ({ className, children, ...props }) => (
  <div className={cn('', className)} {...props}>
    {children}
  </div>
);
CardBody.displayName = 'Card.Body';

const CardFooter = ({ className, children, ...props }) => (
  <div className={cn('mt-4 pt-4 border-t border-border', className)} {...props}>
    {children}
  </div>
);
CardFooter.displayName = 'Card.Footer';

Card.Header = CardHeader;
Card.Body = CardBody;
Card.Footer = CardFooter;

export default Card;
