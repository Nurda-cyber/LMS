const { CourseUser } = require('../models');

/** Доступ: администратор (любой курс) или учитель этого курса (params.id = courseId). */
module.exports = async (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Необходима авторизация' });
  }
  if (req.user.role === 'admin') {
    return next();
  }
  const courseId = req.params.id;
  if (!courseId) {
    return res.status(400).json({ error: 'Не указан курс' });
  }
  if (req.user.role !== 'teacher') {
    return res.status(403).json({ error: 'Доступ только для администратора или учителя этого курса' });
  }
  const membership = await CourseUser.findOne({
    where: { courseId: Number(courseId), userId: req.user.id, role: 'teacher' }
  });
  if (!membership) {
    return res.status(403).json({ error: 'Вы не являетесь учителем этого курса' });
  }
  next();
};
