const { Submission, Assignment, CourseUser, User } = require('../models');

async function findExistingSubmission(assignmentId, studentId) {
  return Submission.findOne({
    where: { assignmentId: Number(assignmentId), studentId: Number(studentId) }
  });
}

async function createSubmission({ assignmentId, studentId, fileUrl, submittedAt }) {
  return Submission.create({
    assignmentId,
    studentId,
    fileUrl,
    submittedAt
  });
}

async function getAssignmentWithCourse(assignmentId) {
  const assignment = await Assignment.findByPk(assignmentId);
  return assignment;
}

async function ensureStudentOnCourse(courseId, studentId) {
  const membership = await CourseUser.findOne({
    where: { courseId: Number(courseId), userId: Number(studentId), role: 'student' }
  });
  return !!membership;
}

async function ensureTeacherOnCourse(courseId, teacherId) {
  const membership = await CourseUser.findOne({
    where: { courseId: Number(courseId), userId: Number(teacherId), role: 'teacher' }
  });
  return !!membership;
}

async function listSubmissionsByAssignment(assignmentId) {
  return Submission.findAll({
    where: { assignmentId: Number(assignmentId) },
    order: [['submittedAt', 'DESC']],
    include: [{ model: User, as: 'Student', attributes: ['id', 'email', 'name'] }]
  });
}

async function findSubmissionWithAssignment(submissionId) {
  const submission = await Submission.findByPk(submissionId, {
    include: [{ model: Assignment, as: 'Assignment' }]
  });
  return submission;
}

async function updateSubmissionGrade(submission, grade, feedback) {
  submission.grade = grade != null && grade !== '' ? String(grade).trim() : null;
  if (feedback !== undefined) {
    submission.feedback = feedback != null && feedback !== '' ? String(feedback).trim() : null;
  }
  await submission.save();
  return submission;
}

module.exports = {
  findExistingSubmission,
  createSubmission,
  getAssignmentWithCourse,
  ensureStudentOnCourse,
  ensureTeacherOnCourse,
  listSubmissionsByAssignment,
  findSubmissionWithAssignment,
  updateSubmissionGrade
};

