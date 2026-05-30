/**
 * Обёртка для асинхронных Express-обработчиков:
 * автоматически передаёт исключения в next() — не нужно писать try/catch.
 */
module.exports = function asyncHandler(fn) {
  return (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);
};
