import React, { useRef, useCallback } from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

const cn = (...inputs) => twMerge(clsx(inputs));

const tabVariants = {
  underline: {
    list: 'flex gap-1 border-b border-border',
    tab: 'px-4 py-2.5 text-sm font-bold transition-colors relative',
    active: 'text-primary after:absolute after:bottom-0 after:inset-x-0 after:h-[2px] after:bg-primary after:rounded-full',
    inactive: 'text-muted hover:text-heading-dark',
  },
  pills: {
    list: 'flex gap-2 p-1 bg-background-alt rounded-xl',
    tab: 'px-4 py-2 text-sm font-bold rounded-lg transition-all',
    active: 'bg-surface-white text-heading-dark shadow-sm',
    inactive: 'text-muted hover:text-heading-dark',
  },
  buttons: {
    list: 'flex gap-2',
    tab: 'px-4 py-2 text-sm font-bold rounded-lg border transition-all',
    active: 'bg-heading-dark text-white border-heading-dark shadow-sm',
    inactive: 'bg-transparent text-muted border-border hover:bg-background-alt hover:text-heading-dark',
  },
};

/**
 * Tabs with keyboard navigation (left/right arrow keys).
 *
 * @example
 * <Tabs
 *   tabs={[{ id: 'all', label: 'الكل' }, { id: 'pending', label: 'معلق' }]}
 *   activeTab="all"
 *   onChange={(id) => setTab(id)}
 *   variant="pills"
 * />
 */
const Tabs = ({
  tabs = [],
  activeTab,
  onChange,
  variant = 'underline',
  className,
  ...props
}) => {
  const tabListRef = useRef(null);
  const style = tabVariants[variant] || tabVariants.underline;

  const handleKeyDown = useCallback((e) => {
    const tabIds = tabs.map(t => t.id);
    const currentIndex = tabIds.indexOf(activeTab);
    let nextIndex = currentIndex;

    // RTL: arrow right = previous, arrow left = next
    const isRtl = document.documentElement.dir === 'rtl' || document.documentElement.getAttribute('dir') === 'rtl';

    if (e.key === 'ArrowRight') {
      nextIndex = isRtl
        ? (currentIndex - 1 + tabIds.length) % tabIds.length
        : (currentIndex + 1) % tabIds.length;
    } else if (e.key === 'ArrowLeft') {
      nextIndex = isRtl
        ? (currentIndex + 1) % tabIds.length
        : (currentIndex - 1 + tabIds.length) % tabIds.length;
    } else if (e.key === 'Home') {
      nextIndex = 0;
    } else if (e.key === 'End') {
      nextIndex = tabIds.length - 1;
    } else {
      return;
    }

    e.preventDefault();
    onChange?.(tabIds[nextIndex]);

    // Focus the new tab button
    const buttons = tabListRef.current?.querySelectorAll('[role="tab"]');
    buttons?.[nextIndex]?.focus();
  }, [tabs, activeTab, onChange]);

  return (
    <div
      ref={tabListRef}
      role="tablist"
      aria-orientation="horizontal"
      className={cn(style.list, className)}
      onKeyDown={handleKeyDown}
      {...props}
    >
      {tabs.map((tab) => {
        const isActive = tab.id === activeTab;
        return (
          <button
            key={tab.id}
            role="tab"
            aria-selected={isActive}
            aria-controls={`tabpanel-${tab.id}`}
            tabIndex={isActive ? 0 : -1}
            onClick={() => onChange?.(tab.id)}
            className={cn(
              style.tab,
              isActive ? style.active : style.inactive,
            )}
          >
            {tab.icon && <span className="inline-flex me-1.5">{tab.icon}</span>}
            {tab.label}
            {tab.count !== undefined && (
              <span className={cn(
                'ms-1.5 text-[10px] px-1.5 py-0.5 rounded-full font-bold',
                isActive ? 'bg-primary/10 text-primary' : 'bg-heading-dark/5 text-muted',
              )}>
                {tab.count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
};

Tabs.displayName = 'Tabs';
export default Tabs;
