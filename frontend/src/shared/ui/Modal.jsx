import { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import { cn } from '../lib/cn';

const SIZE_CLASS = {
  sm: 'ui-modal--sm',
  md: '',
  lg: 'ui-modal--lg',
  xl: 'ui-modal--xl',
};

/**
 * Контролируемый модал. Закрывается по ESC или клику по бэкдропу
 * (если closeOnBackdrop=true). Рендерится в document.body через портал.
 */
export function Modal({
  open,
  onClose,
  title,
  size = 'md',
  closeOnBackdrop = true,
  footer,
  className,
  children,
}) {
  const dialogRef = useRef(null);

  useEffect(() => {
    if (!open) return;
    function onKey(e) {
      if (e.key === 'Escape') onClose?.();
    }
    document.addEventListener('keydown', onKey);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = previousOverflow;
    };
  }, [open, onClose]);

  useEffect(() => {
    if (open && dialogRef.current) {
      dialogRef.current.focus();
    }
  }, [open]);

  if (!open) return null;

  function handleBackdropClick(e) {
    if (e.target === e.currentTarget && closeOnBackdrop) onClose?.();
  }

  return createPortal(
    <div className="ui-modal__backdrop" onMouseDown={handleBackdropClick} role="presentation">
      <div
        ref={dialogRef}
        className={cn('ui-modal', SIZE_CLASS[size], className)}
        role="dialog"
        aria-modal="true"
        aria-label={typeof title === 'string' ? title : undefined}
        tabIndex={-1}
      >
        {title && (
          <header className="ui-modal__header">
            <h3 className="ui-modal__title">{title}</h3>
            <button
              type="button"
              className="ui-modal__close"
              onClick={onClose}
              aria-label="Закрыть"
            >
              <X size={18} aria-hidden />
            </button>
          </header>
        )}
        <div className="ui-modal__body">{children}</div>
        {footer && <footer className="ui-modal__footer">{footer}</footer>}
      </div>
    </div>,
    document.body
  );
}
