import { cn } from '../lib/cn';

const VARIANT_CLASS = {
  neutral: 'ui-badge--neutral',
  primary: 'ui-badge--primary',
  success: 'ui-badge--success',
  warning: 'ui-badge--warning',
  danger: 'ui-badge--danger',
};

export function Badge({ variant = 'neutral', className, children, ...rest }) {
  return (
    <span className={cn('ui-badge', VARIANT_CLASS[variant], className)} {...rest}>
      {children}
    </span>
  );
}
