const { User, Course, CourseUser, Assignment, AssignmentGrade, Submission } = require('../models');
const { Op } = require('sequelize');

/**
 * Admin dashboard: system-wide counts.
 */
async function getAdminStats() {
  const [students, teachers, courses] = await Promise.all([
    User.count({ where: { role: 'student' } }),
    User.count({ where: { role: 'teacher' } }),
    Course.count()
  ]);
  return { students, teachers, courses };
}

/**
 * Teacher dashboard: courses, assignment count, pending submissions.
 */
async function getTeacherDashboard(teacherId) {
  const enrollments = await CourseUser.findAll({
    where: { userId: teacherId, role: 'teacher' },
    include: [{ model: Course, as: 'Course', attributes: ['id', 'name', 'description'] }]
  });
  const courses = enrollments.map((e) => e.Course).filter(Boolean);
  const courseIds = courses.map((c) => c.id);
  if (courseIds.length === 0) {
    return {
      courses: [],
      assignments: 0,
      pending_submissions: 0
    };
  }
  const [assignmentsCount, pendingSubmissionsCount] = await Promise.all([
    Assignment.count({ where: { courseId: { [Op.in]: courseIds } } }),
    Submission.count({
      where: {
        [Op.or]: [{ grade: null }, { grade: '' }]
      },
      include: [{
        model: Assignment,
        as: 'Assignment',
        attributes: [],
        where: { courseId: { [Op.in]: courseIds } },
        required: true
      }]
    })
  ]);
  return {
    courses,
    assignments: assignmentsCount,
    pending_submissions: pendingSubmissionsCount
  };
}

/**
 * Student dashboard: enrolled courses, assignments, grades.
 */
async function getStudentDashboard(studentId) {
  const enrollments = await CourseUser.findAll({
    where: { userId: studentId, role: 'student' },
    include: [{ model: Course, as: 'Course', attributes: ['id', 'name', 'description'] }]
  });
  const courses = enrollments.map((e) => e.Course).filter(Boolean);
  const courseIds = courses.map((c) => c.id);

  let assignments = [];
  let grades = [];

  if (courseIds.length > 0) {
    assignments = await Assignment.findAll({
      where: { courseId: { [Op.in]: courseIds } },
      order: [['createdAt', 'ASC']],
      attributes: ['id', 'courseId', 'title', 'description', 'dueAt', 'createdAt']
    });
    grades = await AssignmentGrade.findAll({
      where: { userId: studentId },
      include: [{ model: Assignment, as: 'Assignment', attributes: ['id', 'title', 'courseId'] }],
      order: [['updatedAt', 'DESC']]
    });
  }

  return {
    courses,
    assignments,
    grades: grades.map((g) => ({
      id: g.id,
      assignmentId: g.assignmentId,
      assignmentTitle: g.Assignment?.title,
      courseId: g.Assignment?.courseId,
      grade: g.grade,
      comment: g.comment,
      submittedAt: g.submittedAt,
      updatedAt: g.updatedAt
    }))
  };
}

module.exports = {
  getAdminStats,
  getTeacherDashboard,
  getStudentDashboard
};
