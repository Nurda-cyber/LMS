const path = require('path');
const fs = require('fs');
const submissionService = require('../services/submissionService');

function ensureUploadsDir() {
  const uploadsPath = path.join(__dirname, '..', 'uploads');
  if (!fs.existsSync(uploadsPath)) {
    fs.mkdirSync(uploadsPath, { recursive: true });
  }
  return uploadsPath;
}

exports.submit = async (req, res) => {
  try {
    const assignmentId = Number(req.params.id);
    const studentId = req.user.id;

    if (!req.file) {
      return res.status(400).json({ error: 'Файл не загружен' });
    }

    const assignment = await submissionService.getAssignmentWithCourse(assignmentId);
    if (!assignment) {
      return res.status(404).json({ error: 'Задание не найдено' });
    }

    const onCourse = await submissionService.ensureStudentOnCourse(assignment.courseId, studentId);
    if (!onCourse) {
      return res.status(403).json({ error: 'Вы не записаны на этот курс как студент' });
    }

    const now = new Date();
    if (assignment.dueAt && new Date(assignment.dueAt) < now) {
      return res.status(400).json({ error: 'Крайний срок истёк. Отправка не разрешена.' });
    }

    const existing = await submissionService.findExistingSubmission(assignmentId, studentId);
    if (existing) {
      return res.status(400).json({ error: 'Задание уже отправлено. Повторная отправка не разрешена.' });
    }

    ensureUploadsDir();

    const relativeUrl = `/uploads/${req.file.filename}`;
    const submission = await submissionService.createSubmission({
      assignmentId,
      studentId,
      fileUrl: relativeUrl,
      submittedAt: now
    });

    res.status(201).json({
      message: 'Файл отправлен',
      submission
    });
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error(err);
    res.status(500).json({ error: 'Ошибка при отправке задания' });
  }
};

exports.listByAssignment = async (req, res) => {
  try {
    const assignmentId = Number(req.params.id);
    const teacherId = req.user.id;

    const assignment = await submissionService.getAssignmentWithCourse(assignmentId);
    if (!assignment) {
      return res.status(404).json({ error: 'Задание не найдено' });
    }

    const isTeacher = req.user.role === 'teacher';
    const isAdmin = req.user.role === 'admin';

    if (!isAdmin) {
      if (!isTeacher) {
        return res.status(403).json({ error: 'Доступ только для учителей или администраторов' });
      }
      const allowed = await submissionService.ensureTeacherOnCourse(assignment.courseId, teacherId);
      if (!allowed) {
        return res.status(403).json({ error: 'Вы не являетесь учителем этого курса' });
      }
    }

    const submissions = await submissionService.listSubmissionsByAssignment(assignmentId);
    res.json(submissions);
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error(err);
    res.status(500).json({ error: 'Ошибка при получении отправленных работ' });
  }
};

exports.grade = async (req, res) => {
  try {
    const submissionId = Number(req.params.id);
    const { grade, feedback } = req.body;

    const submission = await submissionService.findSubmissionWithAssignment(submissionId);
    if (!submission) {
      return res.status(404).json({ error: 'Отправленная работа не найдена' });
    }

    const assignment = submission.Assignment;
    if (!assignment) {
      return res.status(500).json({ error: 'Нарушена связь отправки с заданием' });
    }

    const isTeacher = req.user.role === 'teacher';
    const isAdmin = req.user.role === 'admin';

    if (!isAdmin) {
      if (!isTeacher) {
        return res.status(403).json({ error: 'Доступ только для учителей или администраторов' });
      }
      const allowed = await submissionService.ensureTeacherOnCourse(assignment.courseId, req.user.id);
      if (!allowed) {
        return res.status(403).json({ error: 'Вы не являетесь учителем этого курса' });
      }
    }

    const updated = await submissionService.updateSubmissionGrade(submission, grade, feedback);
    res.json({
      message: 'Оценка сохранена',
      submission: updated
    });
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error(err);
    res.status(500).json({ error: 'Ошибка при сохранении оценки' });
  }
};

