import { cn } from '../lib/cn';

/**
 * Универсальное «пусто» состояние со слотами для иконки, заголовка,
 * описания и действия.
 */
export function EmptyState({ icon, title, description, action, className }) {
  return (
    <div className={cn('ui-empty', className)}>
      {icon && <div className="ui-empty__icon" aria-hidden>{icon}</div>}
      {title && <h4 className="ui-empty__title">{title}</h4>}
      {description && <p className="ui-empty__desc">{description}</p>}
      {action}
    </div>
  );
}
