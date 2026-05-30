const { NotFoundError, ValidationError } = require('../../../shared/errors/AppError');
const FinalGradeCalculator = require('../../../domain/services/FinalGradeCalculator');
const GpaCalculator = require('../../../domain/services/GpaCalculator');
const repository = require('../../../infrastructure/db/repositories/gradingRepository');

/**
 * Use cases оценивания.
 * Каждый use case — одна операция (SRP). Зависимости — только репозиторий и
 * чистые доменные сервисы (FinalGradeCalculator, GpaCalculator).
 */

async function listCategories(courseId) {
  return repository.findCategoriesByCourse(courseId);
}

async function createCategory({ courseId, name, weight = 0, position = 0, description = null }) {
  await ensureCourseExists(courseId);
  validateWeight(weight);
  return repository.createCategory({ courseId, name, weight, position, description });
}

async function updateCategory(id, patch) {
  if (patch.weight !== undefined) validateWeight(patch.weight);
  return repository.updateCategory(id, patch);
}

async function deleteCategory(id) {
  return repository.deleteCategory(id);
}

/**
 * Получить ведомость курса: студенты × задания + итоговая оценка.
 * @returns { students, assignments, categories, grades, finals }
 */
async function getGradebook(courseId) {
  await ensureCourseExists(courseId);

  const [students, assignments, categories, grades, finals] = await Promise.all([
    repository.findCourseStudents(courseId),
    repository.findCourseAssignments(courseId),
    repository.findCategoriesByCourse(courseId),
    repository.findCourseGrades(courseId),
    repository.findFinalGradesByCourse(courseId),
  ]);

  return { students, assignments, categories, grades, finals };
}

/**
 * Пересчитать и сохранить итоговые оценки всех студентов курса
 * на основании текущих категорий, заданий и оценок.
 *
 * @param {Object} params
 * @param {number} params.courseId
 * @param {number|null} params.semesterId
 * @param {boolean} params.finalize  Перевести статус в 'finalized'
 */
async function recalculateFinalGrades({ courseId, semesterId = null, finalize = false }) {
  const { students, assignments, categories, grades } = await getGradebook(courseId);

  if (categories.length === 0) {
    throw new ValidationError('Сначала задайте категории оценок для курса');
  }

  const results = [];
  for (const student of students) {
    const studentGrades = grades.filter((g) => g.userId === student.id);
    const calc = FinalGradeCalculator.calculate({
      categories,
      assignments,
      grades: studentGrades.map((g) => ({ assignmentId: g.assignmentId, score: g.score })),
    });
    const saved = await repository.upsertFinalGrade({
      courseId,
      studentId: student.id,
      semesterId,
      totalScore: calc.total,
      letter: calc.letter,
      gpa: calc.gpa,
      status: finalize ? 'finalized' : 'draft',
    });
    results.push({ student, ...calc, persisted: saved });
  }

  return results;
}

/**
 * Транскрипт студента: итоговые оценки + GPA по семестрам и общий.
 */
async function getStudentTranscript(studentId) {
  const finals = await repository.findFinalGradesByStudent(studentId);

  // Группируем по семестрам
  const bySemester = new Map();
  for (const fg of finals) {
    const key = fg.semesterId || 'no-semester';
    if (!bySemester.has(key)) {
      bySemester.set(key, { semester: fg.semester || null, items: [] });
    }
    bySemester.get(key).items.push({
      courseId: fg.courseId,
      courseName: fg.course?.name || `Курс #${fg.courseId}`,
      totalScore: Number(fg.totalScore),
      letter: fg.letter,
      gpa: fg.gpa !== null ? Number(fg.gpa) : null,
      credits: 1, // TODO: брать из Course.credits в Этапе 2.1
      status: fg.status,
    });
  }

  const semesters = [...bySemester.entries()].map(([_key, value]) => ({
    semester: value.semester,
    items: value.items,
    gpa: GpaCalculator.calculate(value.items),
  }));

  const overallGpa = GpaCalculator.calculate(
    finals.map((f) => ({ gpa: f.gpa !== null ? Number(f.gpa) : null, credits: 1 }))
  );

  return { studentId, semesters, overallGpa };
}

async function ensureCourseExists(courseId) {
  const course = await repository.getCourse(courseId);
  if (!course) throw new NotFoundError(`Курс #${courseId} не найден`);
}

function validateWeight(weight) {
  const n = Number(weight);
  if (!Number.isFinite(n) || n < 0 || n > 100) {
    throw new ValidationError('Вес категории должен быть в диапазоне 0..100');
  }
}

module.exports = {
  listCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  getGradebook,
  recalculateFinalGrades,
  getStudentTranscript,
};
