import { cn } from '../lib/cn';

/**
 * Универсальный скелетон. Размеры задаются через style (width/height) или
 * через семантические варианты.
 */
export function Skeleton({ variant = 'text', width, height, style, className, ...rest }) {
  const modifier = variant === 'circle' ? 'ui-skeleton--circle' : `ui-skeleton--${variant}`;
  return (
    <span
      className={cn('ui-skeleton', modifier, className)}
      style={{ width, height, ...style }}
      aria-hidden
      {...rest}
    />
  );
}
