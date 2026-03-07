const { Course, User, CourseUser } = require('../models');

exports.myCourses = async (req, res) => {
  try {
    const userId = req.user.id;
    const enrollments = await CourseUser.findAll({
      where: { userId },
      include: [{ model: Course, as: 'Course', attributes: ['id', 'name', 'description'] }]
    });
    const courses = enrollments.map((e) => ({
      id: e.Course?.id,
      name: e.Course?.name,
      description: e.Course?.description,
      myRole: e.role
    })).filter((c) => c.id);
    res.json(courses);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
};

exports.create = async (req, res) => {
  try {
    const { name, description } = req.body;
    if (!name || !name.trim()) {
      return res.status(400).json({ error: 'Название курса обязательно' });
    }
    const course = await Course.create({ name: name.trim(), description: description || null });
    res.status(201).json(course);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Ошибка при создании курса' });
  }
};

exports.list = async (req, res) => {
  try {
    const courses = await Course.findAll({
      order: [['createdAt', 'DESC']],
      include: [{
        model: User,
        as: 'users',
        through: { attributes: ['role'] },
        attributes: ['id', 'email', 'name']
      }]
    });
    res.json(courses);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
};

exports.getById = async (req, res) => {
  try {
    const course = await Course.findByPk(req.params.id, {
      include: [{
        model: User,
        as: 'users',
        through: { attributes: ['role'] },
        attributes: ['id', 'email', 'name']
      }]
    });
    if (!course) return res.status(404).json({ error: 'Курс не найден' });
    res.json(course);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
};

exports.update = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description } = req.body;
    const course = await Course.findByPk(id);
    if (!course) return res.status(404).json({ error: 'Курс не найден' });
    if (name !== undefined) course.name = name.trim() || course.name;
    if (description !== undefined) course.description = description === '' ? null : description;
    await course.save();
    const updated = await Course.findByPk(id, {
      include: [{
        model: User,
        as: 'users',
        through: { attributes: ['role'] },
        attributes: ['id', 'email', 'name']
      }]
    });
    res.json(updated);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Ошибка при обновлении курса' });
  }
};

exports.addMember = async (req, res) => {
  try {
    const { id } = req.params;
    const { userId, role } = req.body;
    if (!userId || !role || !['teacher', 'student'].includes(role)) {
      return res.status(400).json({ error: 'Укажите userId и role (teacher или student)' });
    }
    const course = await Course.findByPk(id);
    if (!course) return res.status(404).json({ error: 'Курс не найден' });
    const user = await User.findByPk(userId);
    if (!user) return res.status(404).json({ error: 'Пользователь не найден' });
    if (role === 'teacher' && user.role !== 'teacher') {
      return res.status(400).json({ error: 'На курс можно добавить только пользователя с ролью учитель' });
    }
    if (role === 'student' && user.role !== 'student') {
      return res.status(400).json({ error: 'На курс как студента можно добавить только пользователя с ролью студент' });
    }
    const cId = Number(id);
    const uId = Number(userId);
    const existing = await CourseUser.findOne({ where: { courseId: cId, userId: uId } });
    if (existing) return res.status(409).json({ error: 'Пользователь уже записан на этот курс' });
    await CourseUser.create({ courseId: cId, userId: uId, role });
    const updated = await Course.findByPk(cId, {
      include: [{
        model: User,
        as: 'users',
        through: { attributes: ['role'] },
        attributes: ['id', 'email', 'name']
      }]
    });
    res.status(201).json(updated);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
};

exports.removeMember = async (req, res) => {
  try {
    const { id, userId } = req.params;
    const deleted = await CourseUser.destroy({
      where: { courseId: id, userId }
    });
    if (!deleted) return res.status(404).json({ error: 'Запись не найдена' });
    res.json({ message: 'Удалено' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
};
