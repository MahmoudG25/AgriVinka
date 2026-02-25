/**
 * Accessibility (a11y) Utilities
 * Helper functions and constants for WCAG 2.1 compliance
 */

/**
 * Focus management utilities
 */
export const focusManagement = {
  // Get all focusable elements within a container
  getFocusableElements: (container) => {
    const focusableSelectors = [
      'a[href]',
      'button:not([disabled])',
      'textarea:not([disabled])',
      'input[type="text"]:not([disabled])',
      'input[type="radio"]:not([disabled])',
      'input[type="checkbox"]:not([disabled])',
      'select:not([disabled])',
      '[tabindex]'
    ].join(',');

    return Array.from(container.querySelectorAll(focusableSelectors));
  },

  // Set focus to the first focusable element in a container
  focusFirstElement: (container) => {
    const focusableElements = focusManagement.getFocusableElements(container);
    if (focusableElements.length > 0) {
      focusableElements[0].focus();
    }
  },

  // Set focus to the last focusable element
  focusLastElement: (container) => {
    const focusableElements = focusManagement.getFocusableElements(container);
    if (focusableElements.length > 0) {
      focusableElements[focusableElements.length - 1].focus();
    }
  },

  // Trap focus within a container (for modals)
  trapFocus: (e, container) => {
    const focusableElements = focusManagement.getFocusableElements(container);
    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    if (e.shiftKey) {
      // Shift + Tab
      if (document.activeElement === firstElement) {
        lastElement.focus();
        e.preventDefault();
      }
    } else {
      // Tab
      if (document.activeElement === lastElement) {
        firstElement.focus();
        e.preventDefault();
      }
    }
  }
};

/**
 * ARIA attributes helpers
 */
export const ariaHelpers = {
  // Generate unique ID for aria-labelledby
  generateId: (prefix = 'id') => `${prefix}-${Math.random().toString(36).substr(2, 9)}`,

  // Set loading state aria attributes
  setLoadingState: (element, isLoading) => {
    element.setAttribute('aria-busy', isLoading);
    if (isLoading) {
      element.setAttribute('aria-live', 'polite');
    }
  },

  // Set error state
  setErrorState: (element, error, errorId) => {
    if (error) {
      element.setAttribute('aria-invalid', 'true');
      element.setAttribute('aria-describedby', errorId);
    } else {
      element.removeAttribute('aria-invalid');
      element.removeAttribute('aria-describedby');
    }
  },

  // Announce to screen readers
  announce: (message, priority = 'polite') => {
    const element = document.createElement('div');
    element.setAttribute('role', 'status');
    element.setAttribute('aria-live', priority);
    element.setAttribute('aria-atomic', 'true');
    element.className = 'sr-only'; // Hide visually
    element.textContent = message;
    document.body.appendChild(element);

    // Remove after announcement
    setTimeout(() => element.remove(), 1000);
  }
};

/**
 * Keyboard navigation helpers
 */
export const keyboardHelpers = {
  // Check if key is Enter or Space
  isActivationKey: (e) => e.key === 'Enter' || e.key === ' ',

  // Check if key is Escape
  isEscapeKey: (e) => e.key === 'Escape',

  // Check if key is arrow key
  isArrowKey: (e) => ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key),

  // Get arrow direction
  getArrowDirection: (e) => {
    const directions = {
      'ArrowUp': 'up',
      'ArrowDown': 'down',
      'ArrowLeft': 'left',
      'ArrowRight': 'right'
    };
    return directions[e.key];
  }
};

/**
 * Screen reader only class
 * Add to global CSS:
 * .sr-only {
 *   position: absolute;
 *   width: 1px;
 *   height: 1px;
 *   padding: 0;
 *   margin: -1px;
 *   overflow: hidden;
 *   clip: rect(0,0,0,0);
 *   white-space: nowrap;
 *   border-width: 0;
 * }
 */

/**
 * Color contrast checking (WCAG AA: 4.5:1 for normal text, 3:1 for large text)
 */
export const contrastChecker = {
  // Calculate relative luminance
  getLuminance: (r, g, b) => {
    const [rs, gs, bs] = [r, g, b].map(x => {
      x = x / 255;
      return x <= 0.03928 ? x / 12.92 : Math.pow((x + 0.055) / 1.055, 2.4);
    });
    return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
  },

  // Calculate contrast ratio
  getContrastRatio: (rgb1, rgb2) => {
    const lum1 = contrastChecker.getLuminance(...rgb1);
    const lum2 = contrastChecker.getLuminance(...rgb2);
    const lighter = Math.max(lum1, lum2);
    const darker = Math.min(lum1, lum2);
    return (lighter + 0.05) / (darker + 0.05);
  },

  // Check if colors meet WCAG AA
  meetsAAStandard: (rgb1, rgb2, isLargeText = false) => {
    const ratio = contrastChecker.getContrastRatio(rgb1, rgb2);
    return isLargeText ? ratio >= 3 : ratio >= 4.5;
  }
};

/**
 * Skip link component helper
 * Adds a skip link to jump past navigation
 */
export const skipLinkId = 'main-content';
export const skipLinkStyles = `
  .skip-link {
    position: absolute;
    top: -40px;
    left: 0;
    background: #000;
    color: white;
    padding: 8px;
    text-decoration: none;
    z-index: 100;
  }
  
  .skip-link:focus {
    top: 0;
  }
`;

/**
 * Common ARIA labels for better context
 */
export const ariaLabels = {
  closeButton: 'Close dialog',
  openMenu: 'Open navigation menu',
  closeMenu: 'Close navigation menu',
  search: 'Search',
  loadingData: 'Loading data, please wait',
  sortAscending: 'Sort in ascending order',
  sortDescending: 'Sort in descending order'
};
