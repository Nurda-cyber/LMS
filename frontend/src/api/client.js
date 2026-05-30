/**
 * Прикладные API-функции (тонкая обёртка над shared/api/httpClient).
 * Файл существует для обратной совместимости с уже написанным кодом —
 * новые модули должны импортировать `http` из 'shared/api/httpClient'
 * или специализированные хуки React Query.
 */
import { http } from '../shared/api/httpClient';

const safe = async (promise, fallback) => {
  try {
    return await promise;
  } catch {
    return fallback;
  }
};

export async function register(email, password, name = '') {
  return http.post('/auth/register', { email, password, name });
}

export async function login(email, password) {
  return http.post('/auth/login', { email, password });
}

export async function getMe() {
  return safe(http.get('/auth/me'), null);
}

export async function requestPasswordChange(currentPassword, newPassword) {
  return http.post('/auth/request-password-change', { currentPassword, newPassword });
}

export async function getNotifications() {
  return safe(http.get('/notifications'), []);
}

export async function markNotificationRead(id) {
  return http.put(`/notifications/${id}/read`);
}

export async function deleteNotification(id) {
  return http.delete(`/notifications/${id}`);
}

export async function getPendingPasswordChanges() {
  return safe(http.get('/auth/pending-password-changes'), []);
}

export async function acceptPasswordChange(requestId) {
  return http.post(`/auth/pending-password-changes/${requestId}/accept`);
}

export async function registerTeacher(email, password, name = '') {
  return http.post('/auth/register-teacher', { email, password, name });
}

export async function getTeachers() {
  return safe(http.get('/auth/teachers'), []);
}

export async function getStudents() {
  return safe(http.get('/auth/students'), []);
}

export async function getCourses() {
  return safe(http.get('/courses'), []);
}

export async function getMyCourses() {
  return safe(http.get('/courses/my'), []);
}

export async function createCourse(name, description = '') {
  return http.post('/courses', { name, description });
}

export async function getCourse(id) {
  return http.get(`/courses/${id}`);
}

export async function updateCourse(courseId, name, description = '') {
  return http.put(`/courses/${courseId}`, {
    name: name.trim(),
    description: description || '',
  });
}

export async function addCourseMember(courseId, userId, role) {
  return http.post(`/courses/${courseId}/members`, { userId, role });
}

export async function removeCourseMember(courseId, userId) {
  return http.delete(`/courses/${courseId}/members/${userId}`);
}

export async function getCourseAssignments(courseId) {
  const data = await http.get(`/courses/${courseId}/assignments`);
  return Array.isArray(data) ? data : [];
}

export async function createAssignment(courseId, title, description = '', dueAt = null) {
  return http.post(`/courses/${courseId}/assignments`, {
    title: title.trim(),
    description: description.trim() || undefined,
    dueAt: dueAt || undefined,
  });
}

export async function updateAssignment(courseId, assignmentId, title, description, dueAt) {
  return http.put(`/courses/${courseId}/assignments/${assignmentId}`, {
    title: title?.trim(),
    description: description !== undefined ? description : undefined,
    dueAt: dueAt !== undefined ? dueAt : undefined,
  });
}

export async function submitAssignment(courseId, assignmentId, submissionText) {
  return http.post(`/courses/${courseId}/assignments/${assignmentId}/submit`, {
    submissionText: submissionText != null ? String(submissionText).trim() : '',
  });
}

/** Отправка задания файлом (PDF, DOCX). Максимум 10 МБ. */
export async function submitAssignmentFile(assignmentId, file) {
  const formData = new FormData();
  formData.append('file', file);
  return http.post(`/assignments/${assignmentId}/submit`, formData);
}

export async function deleteAssignment(courseId, assignmentId) {
  return http.delete(`/courses/${courseId}/assignments/${assignmentId}`);
}

export async function setAssignmentGrade(courseId, assignmentId, userId, grade, comment = '') {
  return http.post(`/courses/${courseId}/assignments/${assignmentId}/grades`, {
    userId,
    grade: String(grade).trim(),
    comment: comment.trim() || undefined,
  });
}

/** Список отправленных работ по заданию (для учителя/админа). */
export async function getAssignmentSubmissions(assignmentId) {
  const data = await http.get(`/submissions/assignments/${assignmentId}/submissions`);
  return Array.isArray(data) ? data : [];
}

/** Дашборд администратора: студенты, учителя, курсы (только admin). */
export async function getDashboardAdmin() {
  return http.get('/dashboard/admin');
}

/** Дашборд преподавателя: курсы, кол-во заданий, ожидающие оценки. */
export async function getDashboardTeacher() {
  return http.get('/dashboard/teacher');
}

/** Дашборд студента: курсы, задания, оценки. */
export async function getDashboardStudent() {
  return http.get('/dashboard/student');
}
