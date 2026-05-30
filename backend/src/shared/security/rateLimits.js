const rateLimit = require('express-rate-limit');

const defaultHandler = (_req, res) => {
  res.status(429).json({ error: 'Слишком много запросов. Попробуйте позже.', code: 'RATE_LIMIT' });
};

const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 600,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  handler: defaultHandler,
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 30,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  handler: defaultHandler,
});

module.exports = { globalLimiter, authLimiter };
