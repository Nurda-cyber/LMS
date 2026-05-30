import { forwardRef } from 'react';
import { cn } from '../lib/cn';

/**
 * Универсальная кнопка проекта.
 * Использует базовые классы .btn .btn-<variant> + размеры .btn-sm/.btn-lg.
 */
const VARIANT_CLASS = {
  primary: 'btn-primary',
  secondary: 'btn-secondary',
  danger: 'btn-danger',
  ghost: 'btn-ghost',
  link: 'btn-link',
};

const SIZE_CLASS = {
  sm: 'btn-sm',
  md: '',
  lg: 'btn-lg',
};

export const Button = forwardRef(function Button(
  {
    variant = 'primary',
    size = 'md',
    type = 'button',
    fullWidth = false,
    iconOnly = false,
    loading = false,
    disabled = false,
    leftIcon,
    rightIcon,
    className,
    children,
    ...rest
  },
  ref
) {
  return (
    <button
      ref={ref}
      type={type}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      className={cn(
        'btn',
        VARIANT_CLASS[variant],
        SIZE_CLASS[size],
        fullWidth && 'btn--full',
        iconOnly && 'btn--icon-only',
        className
      )}
      {...rest}
    >
      {loading ? <span className="btn__spinner" aria-hidden /> : leftIcon}
      {!iconOnly && children}
      {!loading && rightIcon}
    </button>
  );
});
