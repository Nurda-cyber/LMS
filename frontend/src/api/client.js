const API_BASE = '/api';

function getToken() {
  return localStorage.getItem('token');
}

export async function register(email, password, name = '') {
  const res = await fetch(`${API_BASE}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password, name })
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || 'Ошибка регистрации');
  return data;
}

export async function login(email, password) {
  const res = await fetch(`${API_BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || 'Ошибка входа');
  return data;
}

export async function getMe() {
  const token = getToken();
  if (!token) return null;
  const res = await fetch(`${API_BASE}/auth/me`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  if (!res.ok) return null;
  return res.json();
}

export async function requestPasswordChange(currentPassword, newPassword) {
  const res = await fetch(`${API_BASE}/auth/request-password-change`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
    body: JSON.stringify({ currentPassword, newPassword })
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || 'Ошибка запроса');
  return data;
}

export async function getNotifications() {
  const res = await fetch(`${API_BASE}/auth/notifications`, { headers: authHeaders() });
  if (!res.ok) return [];
  return res.json();
}

export async function markNotificationRead(id) {
  const res = await fetch(`${API_BASE}/auth/notifications/${id}/read`, {
    method: 'PATCH',
    headers: authHeaders()
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || 'Ошибка');
  }
  return res.json();
}

export async function getPendingPasswordChanges() {
  const res = await fetch(`${API_BASE}/auth/pending-password-changes`, { headers: authHeaders() });
  if (!res.ok) return [];
  return res.json();
}

export async function acceptPasswordChange(requestId) {
  const res = await fetch(`${API_BASE}/auth/pending-password-changes/${requestId}/accept`, {
    method: 'POST',
    headers: authHeaders()
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || 'Ошибка одобрения');
  return data;
}

function authHeaders() {
  return { Authorization: `Bearer ${localStorage.getItem('token')}` };
}

export async function registerTeacher(email, password, name = '') {
  const res = await fetch(`${API_BASE}/auth/register-teacher`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
    body: JSON.stringify({ email, password, name })
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || 'Ошибка регистрации учителя');
  return data;
}

export async function getTeachers() {
  const res = await fetch(`${API_BASE}/auth/teachers`, { headers: authHeaders() });
  if (!res.ok) return [];
  return res.json();
}

export async function getStudents() {
  const res = await fetch(`${API_BASE}/auth/students`, { headers: authHeaders() });
  if (!res.ok) return [];
  return res.json();
}

export async function getCourses() {
  const res = await fetch(`${API_BASE}/courses`, { headers: authHeaders() });
  if (!res.ok) return [];
  return res.json();
}

export async function getMyCourses() {
  const res = await fetch(`${API_BASE}/courses/my`, { headers: authHeaders() });
  if (!res.ok) return [];
  return res.json();
}

export async function createCourse(name, description = '') {
  const res = await fetch(`${API_BASE}/courses`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
    body: JSON.stringify({ name, description })
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || 'Ошибка создания курса');
  return data;
}

export async function getCourse(id) {
  const res = await fetch(`${API_BASE}/courses/${id}`, { headers: authHeaders() });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || 'Курс не найден');
  return data;
}

export async function updateCourse(courseId, name, description = '') {
  const res = await fetch(`${API_BASE}/courses/${courseId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
    body: JSON.stringify({ name: name.trim(), description: description || '' })
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || 'Ошибка обновления курса');
  return data;
}

export async function addCourseMember(courseId, userId, role) {
  const res = await fetch(`${API_BASE}/courses/${courseId}/members`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
    body: JSON.stringify({ userId, role })
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || 'Ошибка добавления');
  return data;
}

export async function removeCourseMember(courseId, userId) {
  const res = await fetch(`${API_BASE}/courses/${courseId}/members/${userId}`, {
    method: 'DELETE',
    headers: authHeaders()
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || 'Ошибка удаления');
  }
}

export async function getCourseAssignments(courseId) {
  const res = await fetch(`${API_BASE}/courses/${courseId}/assignments`, { headers: authHeaders() });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || 'Ошибка загрузки заданий');
  return Array.isArray(data) ? data : [];
}

export async function createAssignment(courseId, title, description = '') {
  const res = await fetch(`${API_BASE}/courses/${courseId}/assignments`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
    body: JSON.stringify({ title: title.trim(), description: description.trim() || undefined })
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || 'Ошибка создания задания');
  return data;
}

export async function updateAssignment(courseId, assignmentId, title, description) {
  const res = await fetch(`${API_BASE}/courses/${courseId}/assignments/${assignmentId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
    body: JSON.stringify({ title: title?.trim(), description: description !== undefined ? description : undefined })
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || 'Ошибка обновления задания');
  return data;
}

export async function deleteAssignment(courseId, assignmentId) {
  const res = await fetch(`${API_BASE}/courses/${courseId}/assignments/${assignmentId}`, {
    method: 'DELETE',
    headers: authHeaders()
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || 'Ошибка удаления');
  }
}

export async function setAssignmentGrade(courseId, assignmentId, userId, grade, comment = '') {
  const res = await fetch(`${API_BASE}/courses/${courseId}/assignments/${assignmentId}/grades`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
    body: JSON.stringify({ userId, grade: String(grade).trim(), comment: comment.trim() || undefined })
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || 'Ошибка сохранения оценки');
  return data;
}
