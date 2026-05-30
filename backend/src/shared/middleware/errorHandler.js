const { ZodError } = require('zod');
const { AppError } = require('../errors/AppError');
const logger = require('../logger');

/**
 * Унифицированный обработчик ошибок Express.
 * Формат ответа: { error: string, code: string, details?: any }
 */
function errorHandler(err, req, res, _next) {
  if (err instanceof ZodError) {
    return res.status(400).json({
      error: 'Некорректные данные',
      code: 'VALIDATION_ERROR',
      details: err.issues.map((i) => ({
        path: i.path.join('.'),
        message: i.message,
        code: i.code,
      })),
    });
  }

  if (err instanceof AppError) {
    if (err.status >= 500) {
      logger.error({ err, path: req.path, method: req.method }, 'AppError 5xx');
    } else {
      logger.warn({ code: err.code, status: err.status, path: req.path }, err.message);
    }
    return res.status(err.status).json({
      error: err.message,
      code: err.code,
      ...(err.details ? { details: err.details } : {}),
    });
  }

  if (err?.name === 'SequelizeValidationError' || err?.name === 'SequelizeUniqueConstraintError') {
    return res.status(400).json({
      error: 'Ошибка валидации',
      code: 'DB_VALIDATION_ERROR',
      details: (err.errors || []).map((e) => ({ path: e.path, message: e.message })),
    });
  }

  if (err?.type === 'entity.too.large') {
    return res.status(413).json({ error: 'Тело запроса слишком большое', code: 'PAYLOAD_TOO_LARGE' });
  }

  logger.error({ err, path: req.path, method: req.method }, 'Unhandled error');
  return res.status(500).json({ error: 'Внутренняя ошибка сервера', code: 'INTERNAL_ERROR' });
}

function notFoundHandler(req, res) {
  return res.status(404).json({ error: 'Маршрут не найден', code: 'NOT_FOUND', path: req.path });
}

module.exports = { errorHandler, notFoundHandler };
