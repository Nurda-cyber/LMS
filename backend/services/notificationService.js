const { Notification, CourseUser, Assignment } = require('../models');
const { Op } = require('sequelize');

async function createNotification({ userId, title, message, type, assignmentId = null }) {
  if (!userId || !title || !message || !type) {
    throw new Error('userId, title, message и type обязательны');
  }
  return Notification.create({
    userId,
    assignmentId,
    title,
    message,
    type,
    isRead: false
  });
}

async function getUserNotifications(userId, limit = 50) {
  return Notification.findAll({
    where: { userId },
    order: [['createdAt', 'DESC']],
    limit
  });
}

async function markNotificationRead(id, userId) {
  const notification = await Notification.findOne({
    where: { id: Number(id), userId: Number(userId) }
  });
  if (!notification) return null;
  notification.isRead = true;
  await notification.save();
  return notification;
}

async function deleteNotification(id, userId) {
  return Notification.destroy({
    where: { id: Number(id), userId: Number(userId) }
  });
}

// ——— Доменные сценарии для заданий

async function notifyStudentsAboutNewAssignment(assignment) {
  const courseId = assignment.courseId;
  const students = await CourseUser.findAll({
    where: { courseId, role: 'student' }
  });
  const title = 'Новое задание';
  const message = `Доступно новое задание: "${assignment.title}".`;
  await Promise.all(
    students.map((s) =>
      createNotification({
        userId: s.userId,
        assignmentId: assignment.id,
        title,
        message,
        type: 'assignment'
      })
    )
  );
}

async function notifyStudentAboutGrade(assignment, userId, grade) {
  const title = 'Ваше задание было оценено';
  const gradePart = grade != null && grade !== '' ? ` Оценка: ${grade}.` : '';
  const message = `Ваше задание "${assignment.title}" было оценено.${gradePart}`;
  await createNotification({
    userId,
    assignmentId: assignment.id,
    title,
    message,
    type: 'grade'
  });
}

async function createDeadlineNotificationsWindow(windowStart, windowEnd) {
  const assignments = await Assignment.findAll({
    where: {
      dueAt: {
        [Op.between]: [windowStart, windowEnd]
      }
    }
  });
  if (!assignments.length) return;

  const title = 'Крайний срок приближается';

  for (const assignment of assignments) {
    const students = await CourseUser.findAll({
      where: { courseId: assignment.courseId, role: 'student' }
    });
    for (const s of students) {
      const existing = await Notification.findOne({
        where: {
          userId: s.userId,
          assignmentId: assignment.id,
          type: 'deadline'
        }
      });
      if (existing) continue;
      const message = `Крайний срок по заданию "${assignment.title}" приближается. Срок сдачи: ${new Date(
        assignment.dueAt
      ).toLocaleString('ru-RU')}.`;
      await createNotification({
        userId: s.userId,
        assignmentId: assignment.id,
        title,
        message,
        type: 'deadline'
      });
    }
  }
}

module.exports = {
  createNotification,
  getUserNotifications,
  markNotificationRead,
  deleteNotification,
  notifyStudentsAboutNewAssignment,
  notifyStudentAboutGrade,
  createDeadlineNotificationsWindow
};

