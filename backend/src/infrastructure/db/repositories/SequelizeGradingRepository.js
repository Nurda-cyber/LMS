const { NotFoundError } = require('../../../shared/errors/AppError');

/**
 * Sequelize-реализация GradingRepository.
 * Все обращения к БД сосредоточены здесь — use-cases остаются ORM-агностичными.
 */
class SequelizeGradingRepository {
  constructor({ models }) {
    this.models = models;
  }

  async findCategoriesByCourse(courseId) {
    const rows = await this.models.GradeCategory.findAll({
      where: { courseId },
      order: [['position', 'ASC'], ['id', 'ASC']],
    });
    return rows.map((r) => r.get({ plain: true }));
  }

  async createCategory(payload) {
    const row = await this.models.GradeCategory.create(payload);
    return row.get({ plain: true });
  }

  async updateCategory(id, patch) {
    const row = await this.models.GradeCategory.findByPk(id);
    if (!row) throw new NotFoundError(`Категория #${id} не найдена`);
    await row.update(patch);
    return row.get({ plain: true });
  }

  async deleteCategory(id) {
    const deleted = await this.models.GradeCategory.destroy({ where: { id } });
    if (deleted === 0) throw new NotFoundError(`Категория #${id} не найдена`);
  }

  async getCourse(courseId) {
    const row = await this.models.Course.findByPk(courseId);
    return row ? row.get({ plain: true }) : null;
  }

  async findCourseStudents(courseId) {
    const rows = await this.models.CourseUser.findAll({
      where: { courseId, role: 'student' },
      include: [{ model: this.models.User, attributes: ['id', 'name', 'email'] }],
    });
    return rows
      .map((r) => r.User?.get({ plain: true }))
      .filter(Boolean);
  }

  async findCourseAssignments(courseId) {
    const rows = await this.models.Assignment.findAll({
      where: { courseId },
      order: [['id', 'ASC']],
    });
    return rows.map((r) => r.get({ plain: true }));
  }

  async findCourseGrades(courseId) {
    const assignments = await this.models.Assignment.findAll({
      where: { courseId },
      attributes: ['id'],
    });
    const assignmentIds = assignments.map((a) => a.id);
    if (assignmentIds.length === 0) return [];
    const rows = await this.models.AssignmentGrade.findAll({
      where: { assignmentId: assignmentIds },
    });
    return rows.map((r) => {
      const plain = r.get({ plain: true });
      return {
        id: plain.id,
        assignmentId: plain.assignmentId,
        userId: plain.userId,
        score: parseScore(plain.grade),
        comment: plain.comment || null,
      };
    });
  }

  async upsertFinalGrade({ courseId, studentId, semesterId, totalScore, letter, gpa, status }) {
    const where = { courseId, studentId };
    if (semesterId) where.semesterId = semesterId;
    const [row] = await this.models.FinalGrade.findOrCreate({
      where,
      defaults: { courseId, studentId, semesterId: semesterId || null, totalScore, letter, gpa, status },
    });
    await row.update({ totalScore, letter, gpa, status });
    return row.get({ plain: true });
  }

  async findFinalGradesByCourse(courseId) {
    const rows = await this.models.FinalGrade.findAll({
      where: { courseId },
    });
    return rows.map((r) => r.get({ plain: true }));
  }

  async findFinalGradesByStudent(studentId) {
    const rows = await this.models.FinalGrade.findAll({
      where: { studentId },
      include: [
        { model: this.models.Course, as: 'course', attributes: ['id', 'name'] },
        { model: this.models.Semester, as: 'semester', attributes: ['id', 'term', 'academicYearId'] },
      ],
      order: [['updatedAt', 'DESC']],
    });
    return rows.map((r) => r.get({ plain: true }));
  }
}

function parseScore(raw) {
  if (raw === null || raw === undefined || raw === '') return null;
  const num = Number(raw);
  if (Number.isFinite(num)) return num;
  return null; // буквенные оценки в legacy игнорируем при расчёте процентов
}

module.exports = SequelizeGradingRepository;
