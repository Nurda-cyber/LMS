module.exports = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Необходима авторизация' });
  }
  if (req.user.role !== 'teacher') {
    return res.status(403).json({ error: 'Доступ только для преподавателя' });
  }
  next();
};
