/**
 * Базовый класс для всех ошибок приложения.
 * Использует семантические коды и HTTP-статусы для единого формата ответов.
 */
class AppError extends Error {
  constructor(message, { status = 500, code = 'INTERNAL_ERROR', details = null, cause = null } = {}) {
    super(message);
    this.name = this.constructor.name;
    this.status = status;
    this.code = code;
    this.details = details;
    this.cause = cause;
    Error.captureStackTrace?.(this, this.constructor);
  }
}

class ValidationError extends AppError {
  constructor(message = 'Некорректные данные', details = null) {
    super(message, { status: 400, code: 'VALIDATION_ERROR', details });
  }
}

class UnauthorizedError extends AppError {
  constructor(message = 'Необходима авторизация') {
    super(message, { status: 401, code: 'UNAUTHORIZED' });
  }
}

class ForbiddenError extends AppError {
  constructor(message = 'Доступ запрещён') {
    super(message, { status: 403, code: 'FORBIDDEN' });
  }
}

class NotFoundError extends AppError {
  constructor(message = 'Ресурс не найден') {
    super(message, { status: 404, code: 'NOT_FOUND' });
  }
}

class ConflictError extends AppError {
  constructor(message = 'Конфликт состояния', details = null) {
    super(message, { status: 409, code: 'CONFLICT', details });
  }
}

class RateLimitError extends AppError {
  constructor(message = 'Слишком много запросов') {
    super(message, { status: 429, code: 'RATE_LIMIT' });
  }
}

module.exports = {
  AppError,
  ValidationError,
  UnauthorizedError,
  ForbiddenError,
  NotFoundError,
  ConflictError,
  RateLimitError,
};
