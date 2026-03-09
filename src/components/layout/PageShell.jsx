import React from 'react';
import { PageTransition } from '../../utils/motion';

/**
 * PageShell - Single source of truth for top-level page layout.
 * Enforces maximum width, horizontal padding, and mobile safe areas
 * without collapsing descendant grids/flexboxes.
 * Includes a subtle page-enter fade animation.
 */
const PageShell = ({ children, className = '', narrow = false }) => {
  return (
    <main
      className={`
        w-full mx-auto px-4 sm:px-6 lg:px-8 pb-safe min-w-0
        ${narrow ? 'max-w-4xl' : 'max-w-[1440px]'}
        ${className}
      `}
    >
      <PageTransition>{children}</PageTransition>
    </main>
  );
};

export default PageShell;
