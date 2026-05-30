/**
 * Ошибка HTTP-запроса с дополнительной информацией от сервера:
 * status, code (семантический), details.
 */
export class HttpError extends Error {
  constructor(message, { status = 0, code = 'NETWORK_ERROR', details = null } = {}) {
    super(message);
    this.name = 'HttpError';
    this.status = status;
    this.code = code;
    this.details = details;
  }

  get isUnauthorized() {
    return this.status === 401;
  }

  get isForbidden() {
    return this.status === 403;
  }

  get isValidation() {
    return this.status === 400 || this.code === 'VALIDATION_ERROR';
  }
}
