const { Course, User, CourseUser, Assignment, AssignmentGrade } = require('../models');
const notificationService = require('../services/notificationService');

exports.myCourses = async (req, res) => {
  try {
    const userId = req.user.id;
    const enrollments = await CourseUser.findAll({
      where: { userId },
      include: [{ model: Course, as: 'Course', attributes: ['id', 'name', 'description'] }]
    });
    const courseIds = enrollments.map((e) => e.Course?.id).filter(Boolean);
    const assignments = courseIds.length
      ? await Assignment.findAll({
          where: { courseId: courseIds },
          order: [['createdAt', 'ASC']],
          include: [{
            model: AssignmentGrade,
            as: 'AssignmentGrades',
            where: { userId },
            required: false,
            attributes: ['id', 'grade', 'comment', 'updatedAt']
          }]
        })
      : [];
    const assignmentsByCourse = {};
    assignments.forEach((a) => {
      if (!assignmentsByCourse[a.courseId]) assignmentsByCourse[a.courseId] = [];
      const g = a.AssignmentGrades?.[0];
      assignmentsByCourse[a.courseId].push({
        id: a.id,
        title: a.title,
        description: a.description,
        dueAt: a.dueAt,
        myGrade: g?.grade ?? null,
        myGradeComment: g?.comment ?? null,
        mySubmissionText: g?.submissionText ?? null,
        mySubmittedAt: g?.submittedAt ?? null,
        gradedAt: g?.updatedAt ?? null
      });
    });
    const courses = enrollments.map((e) => ({
      id: e.Course?.id,
      name: e.Course?.name,
      description: e.Course?.description,
      myRole: e.role,
      assignments: assignmentsByCourse[e.Course?.id] || []
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

// ——— Задания курса (доступ: участник курса — админ, преподаватель или студент)
exports.listAssignments = async (req, res) => {
  try {
    const { id } = req.params;
    const isStudent = req.user.role === 'student';
    const assignments = await Assignment.findAll({
      where: { courseId: id },
      order: [['createdAt', 'ASC']],
      include: [{
        model: AssignmentGrade,
        as: 'AssignmentGrades',
        ...(isStudent ? { where: { userId: req.user.id } } : {}),
        required: false,
        include: [{ model: User, as: 'User', attributes: ['id', 'email', 'name'] }]
      }]
    });
    const list = assignments.map((a) => ({
      id: a.id,
      title: a.title,
      description: a.description,
      dueAt: a.dueAt,
      createdAt: a.createdAt,
      grades: (a.AssignmentGrades || []).map((g) => ({
        id: g.id,
        userId: g.userId,
        email: g.User?.email,
        name: g.User?.name,
        grade: g.grade,
        comment: g.comment,
        submissionText: g.submissionText,
        submittedAt: g.submittedAt,
        updatedAt: g.updatedAt
      }))
    }));
    res.json(list);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
};

exports.createAssignment = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, dueAt } = req.body;
    if (!title || !title.trim()) {
      return res.status(400).json({ error: 'Название задания обязательно' });
    }
    const course = await Course.findByPk(id);
    if (!course) return res.status(404).json({ error: 'Курс не найден' });
    const assignment = await Assignment.create({
      courseId: Number(id),
      title: title.trim(),
      description: description ? description.trim() : null,
      dueAt: dueAt ? new Date(dueAt) : null
    });
    await notificationService.notifyStudentsAboutNewAssignment(assignment);
    res.status(201).json(assignment);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Ошибка при создании задания' });
  }
};

exports.updateAssignment = async (req, res) => {
  try {
    const { id, assignmentId } = req.params;
    const { title, description, dueAt } = req.body;
    const assignment = await Assignment.findOne({
      where: { id: assignmentId, courseId: id }
    });
    if (!assignment) return res.status(404).json({ error: 'Задание не найдено' });
    if (title !== undefined) assignment.title = title.trim() || assignment.title;
    if (description !== undefined) assignment.description = description === '' ? null : description.trim();
    if (dueAt !== undefined) assignment.dueAt = dueAt ? new Date(dueAt) : null;
    await assignment.save();
    res.json(assignment);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Ошибка при обновлении задания' });
  }
};

exports.deleteAssignment = async (req, res) => {
  try {
    const { id, assignmentId } = req.params;
    const deleted = await Assignment.destroy({
      where: { id: assignmentId, courseId: id }
    });
    if (!deleted) return res.status(404).json({ error: 'Задание не найдено' });
    res.json({ message: 'Задание удалено' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
};

/** Отправка задания студентом: один раз, до истечения срока. */
exports.submitAssignment = async (req, res) => {
  try {
    const { id: courseId, assignmentId } = req.params;
    const { submissionText } = req.body;
    const userId = req.user.id;
    if (req.user.role !== 'student') {
      return res.status(403).json({ error: 'Отправлять задание могут только студенты' });
    }
    const isOnCourse = await CourseUser.findOne({
      where: { courseId, userId, role: 'student' }
    });
    if (!isOnCourse) {
      return res.status(403).json({ error: 'Вы не записаны на этот курс как студент' });
    }
    const assignment = await Assignment.findOne({
      where: { id: assignmentId, courseId }
    });
    if (!assignment) {
      return res.status(404).json({ error: 'Задание не найдено' });
    }
    const now = new Date();
    if (assignment.dueAt && new Date(assignment.dueAt) < now) {
      return res.status(400).json({ error: 'Крайний срок истёк. Отправка закрыта.' });
    }
    const existing = await AssignmentGrade.findOne({
      where: { assignmentId: assignment.id, userId }
    });
    if (existing) {
      return res.status(400).json({ error: 'Задание уже отправлено. Повторная отправка не разрешена.' });
    }
    const record = await AssignmentGrade.create({
      assignmentId: assignment.id,
      userId,
      submissionText: submissionText != null ? String(submissionText).trim() : null,
      submittedAt: now,
      grade: null,
      comment: null
    });
    res.status(201).json(record);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Ошибка при отправке задания' });
  }
};

exports.setGrade = async (req, res) => {
  try {
    const { id, assignmentId } = req.params;
    const { userId, grade, comment } = req.body;
    if (!userId) {
      return res.status(400).json({ error: 'Укажите userId' });
    }
    const gradeStr = grade !== undefined && grade !== null ? String(grade).trim() : '';
    const assignment = await Assignment.findOne({
      where: { id: assignmentId, courseId: id }
    });
    if (!assignment) return res.status(404).json({ error: 'Задание не найдено' });
    const isStudentOnCourse = await CourseUser.findOne({
      where: { courseId: id, userId: Number(userId), role: 'student' }
    });
    if (!isStudentOnCourse) {
      return res.status(400).json({ error: 'Пользователь не является студентом этого курса' });
    }
    const [record] = await AssignmentGrade.findOrCreate({
      where: { assignmentId: assignment.id, userId: Number(userId) },
      defaults: { grade: gradeStr || null, comment: comment ? comment.trim() : null }
    });
    if (!record.isNewRecord) {
      if (gradeStr !== '') record.grade = gradeStr;
      if (comment !== undefined) record.comment = comment ? comment.trim() : null;
      await record.save();
    } else if (gradeStr === '') {
      record.grade = null;
      await record.save();
    }
    const withUser = await AssignmentGrade.findByPk(record.id, {
      include: [{ model: User, as: 'User', attributes: ['id', 'email', 'name'] }]
    });
    await notificationService.notifyStudentAboutGrade(assignment, Number(userId), record.grade);
    res.json(withUser);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Ошибка при сохранении оценки' });
  }
};
