import React, { useEffect, useRef, useCallback } from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

const cn = (...inputs) => twMerge(clsx(inputs));

const modalSizes = {
  sm: 'max-w-sm',
  md: 'max-w-lg',
  lg: 'max-w-2xl',
  xl: 'max-w-4xl',
  full: 'max-w-[95vw]',
};

/**
 * Accessible Modal / Dialog.
 * - Closes on Escape
 * - Closes on backdrop click
 * - Traps focus
 * - Prevents body scroll
 *
 * @example
 * <Modal open={isOpen} onClose={() => setIsOpen(false)} title="تأكيد الحذف">
 *   <p>هل أنت متأكد؟</p>
 * </Modal>
 */
const Modal = ({
  open,
  onClose,
  title,
  size = 'md',
  className,
  children,
}) => {
  const dialogRef = useRef(null);
  const previousFocusRef = useRef(null);

  // Close on Escape
  const handleKeyDown = useCallback((e) => {
    if (e.key === 'Escape') onClose?.();
  }, [onClose]);

  // Trap focus & manage body scroll
  useEffect(() => {
    if (open) {
      previousFocusRef.current = document.activeElement;
      document.body.style.overflow = 'hidden';

      // Focus the dialog
      requestAnimationFrame(() => {
        dialogRef.current?.focus();
      });

      document.addEventListener('keydown', handleKeyDown);
    } else {
      document.body.style.overflow = '';
      previousFocusRef.current?.focus();
    }

    return () => {
      document.body.style.overflow = '';
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [open, handleKeyDown]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="presentation"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm animate-[fadeIn_150ms_ease-out]"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Dialog */}
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        tabIndex={-1}
        className={cn(
          'relative w-full bg-surface-white rounded-2xl shadow-xl animate-scale-in',
          'focus:outline-none',
          modalSizes[size],
          className,
        )}
      >
        {/* Header */}
        {title && (
          <div className="flex items-center justify-between p-6 pb-0">
            <h2 className="text-lg font-bold text-heading-dark">{title}</h2>
            <button
              onClick={onClose}
              className="w-8 h-8 flex items-center justify-center rounded-lg text-muted hover:bg-background-alt hover:text-heading-dark transition-colors"
              aria-label="إغلاق"
            >
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" className="stroke-current">
                <path d="M6 6l8 8M14 6l-8 8" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </button>
          </div>
        )}

        {/* Body */}
        <div className="p-6">
          {children}
        </div>
      </div>
    </div>
  );
};

/* ─── Sub-components ─── */
const ModalFooter = ({ className, children, ...props }) => (
  <div className={cn('flex items-center justify-end gap-3 pt-4 border-t border-border', className)} {...props}>
    {children}
  </div>
);
ModalFooter.displayName = 'Modal.Footer';

Modal.Footer = ModalFooter;
Modal.displayName = 'Modal';
export default Modal;
