const { CourseUser } = require('../models');

/**
 * Доступ: администратор (любой курс), учитель этого курса или студент, зачисленный на курс.
 * Используется для просмотра курса и списка заданий.
 */
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
  const cId = Number(courseId);
  const membership = await CourseUser.findOne({
    where: { courseId: cId, userId: req.user.id }
  });
  if (!membership) {
    return res.status(403).json({ error: 'Курс не найден или у вас нет доступа к этому курсу' });
  }
  next();
};
