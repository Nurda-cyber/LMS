const errors = require('./errors/AppError');
const logger = require('./logger');
const { errorHandler, notFoundHandler } = require('./middleware/errorHandler');
const validate = require('./middleware/validate');
const authorize = require('./security/authorize');
const permissions = require('./security/permissions');
const rateLimits = require('./security/rateLimits');
const asyncHandler = require('./http/asyncHandler');

module.exports = {
  ...errors,
  logger,
  errorHandler,
  notFoundHandler,
  validate,
  authorize,
  ...permissions,
  ...rateLimits,
  asyncHandler,
};
