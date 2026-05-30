import toast from 'react-hot-toast';
import { HttpError } from '../api/HttpError';

/**
 * Унифицированные функции уведомлений.
 * Используются вместо прямого вызова toast.* — единая точка стилизации/логики.
 */
export const notify = {
  success: (message, options) => toast.success(message, options),
  error: (message, options) => toast.error(message, options),
  info: (message, options) => toast(message, options),

  /** Показывает ошибку из HttpError или произвольного объекта Error/строки. */
  fromError(err, fallback = 'Произошла ошибка') {
    if (!err) {
      return toast.error(fallback);
    }
    if (err instanceof HttpError) {
      return toast.error(err.message || fallback);
    }
    if (err instanceof Error) {
      return toast.error(err.message || fallback);
    }
    return toast.error(String(err));
  },
};
