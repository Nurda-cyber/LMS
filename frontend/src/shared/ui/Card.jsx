import { cn } from '../lib/cn';

/**
 * Базовая карточка: заголовок, описание, действия и тело.
 * Header выводится только если задан title, subtitle или actions.
 */
export function Card({
  title,
  subtitle,
  actions,
  flush = false,
  className,
  children,
  ...rest
}) {
  const hasHeader = title || subtitle || actions;
  return (
    <section className={cn('ui-card', flush && 'ui-card--flush', className)} {...rest}>
      {hasHeader && (
        <header className="ui-card__header">
          <div>
            {title && <h3 className="ui-card__title">{title}</h3>}
            {subtitle && <p className="ui-card__subtitle">{subtitle}</p>}
          </div>
          {actions && <div className="ui-card__actions">{actions}</div>}
        </header>
      )}
      <div className="ui-card__body">{children}</div>
    </section>
  );
}
