/**
 * Универсальный middleware для валидации входных данных через Zod.
 *
 * Поддерживает три источника: body, query, params.
 * После успешной валидации заменяет исходные значения на распарсенные
 * (с приведёнными типами).
 *
 * Использование:
 *   const schemas = { body: z.object({...}), params: z.object({...}) };
 *   router.post('/x', validate(schemas), controller.handler);
 */
function validate(schemas) {
  return (req, _res, next) => {
    try {
      if (schemas.body) req.body = schemas.body.parse(req.body);
      if (schemas.query) req.query = schemas.query.parse(req.query);
      if (schemas.params) req.params = schemas.params.parse(req.params);
      next();
    } catch (err) {
      next(err);
    }
  };
}

module.exports = validate;
