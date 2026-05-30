const { roleHasPermission } = require('./permissions');
const { UnauthorizedError, ForbiddenError } = require('../errors/AppError');

/**
 * Middleware-фабрика: проверяет, что пользователь имеет одно из указанных разрешений.
 *
 *   router.post('/...', auth, authorize(PERMISSIONS.GRADE_ASSIGN), handler)
 *   router.post('/...', auth, authorize([PERMISSIONS.A, PERMISSIONS.B]), handler) // OR
 */
function authorize(permissionOrList) {
  const required = Array.isArray(permissionOrList) ? permissionOrList : [permissionOrList];

  return (req, _res, next) => {
    if (!req.user) return next(new UnauthorizedError());
    const allowed = required.some((p) => roleHasPermission(req.user.role, p));
    if (!allowed) return next(new ForbiddenError());
    next();
  };
}

module.exports = authorize;
