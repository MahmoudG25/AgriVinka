import React from 'react';

/**
 * PageShell - Single source of truth for top-level page layout.
 * Enforces maximum width, horizontal padding, and mobile safe areas
 * without collapsing descendant grids/flexboxes.
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
      {children}
    </main>
  );
};

export default PageShell;
