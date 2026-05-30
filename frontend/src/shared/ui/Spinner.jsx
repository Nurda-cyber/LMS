import { cn } from '../lib/cn';

const SIZE_CLASS = {
  sm: 'ui-spinner--sm',
  md: '',
  lg: 'ui-spinner--lg',
};

export function Spinner({ size = 'md', className, ...rest }) {
  return (
    <span
      className={cn('ui-spinner', SIZE_CLASS[size], className)}
      role="status"
      aria-label="Загрузка"
      {...rest}
    />
  );
}
