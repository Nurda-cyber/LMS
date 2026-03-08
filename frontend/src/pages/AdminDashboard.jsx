import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import * as api from '../api/client';

function formatDate(iso) {
  if (!iso) return '—';
  try {
    return new Date(iso).toLocaleString('ru-RU', {
      day: '2-digit', month: '2-digit', year: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });
  } catch {
    return iso;
  }
}

function CourseCard({ course, teachers, students, onRefresh }) {
  const users = (course.users || []).map((u) => ({ ...u, role: u.CourseUser?.role ?? u.role }));
  const courseTeachers = users.filter((u) => u.role === 'teacher');
  const courseStudents = users.filter((u) => u.role === 'student');
  const [addTeacherId, setAddTeacherId] = useState('');
  const [addStudentId, setAddStudentId] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [editing, setEditing] = useState(false);
  const [editName, setEditName] = useState(course.name);
  const [editDesc, setEditDesc] = useState(course.description || '');
  const [editSaving, setEditSaving] = useState(false);
  const [removingId, setRemovingId] = useState(null);

  const teachersNotInCourse = teachers.filter((t) => !courseTeachers.some((ct) => ct.id === t.id));
  const studentsNotInCourse = students.filter((s) => !courseStudents.some((cs) => cs.id === s.id));

  async function handleAddTeacher(e) {
    e.preventDefault();
    if (!addTeacherId) return;
    setError('');
    setLoading(true);
    try {
      await api.addCourseMember(course.id, Number(addTeacherId), 'teacher');
      setAddTeacherId('');
      onRefresh();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleAddStudent(e) {
    e.preventDefault();
    if (!addStudentId) return;
    setError('');
    setLoading(true);
    try {
      await api.addCourseMember(course.id, Number(addStudentId), 'student');
      setAddStudentId('');
      onRefresh();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleSaveCourse(e) {
    e.preventDefault();
    setEditSaving(true);
    setError('');
    try {
      await api.updateCourse(course.id, editName, editDesc);
      setEditing(false);
      onRefresh();
    } catch (err) {
      setError(err.message);
    } finally {
      setEditSaving(false);
    }
  }

  function startEdit() {
    setEditName(course.name);
    setEditDesc(course.description || '');
    setEditing(true);
    setError('');
  }

  async function handleRemoveMember(userId) {
    setRemovingId(userId);
    setError('');
    try {
      await api.removeCourseMember(course.id, userId);
      onRefresh();
    } catch (err) {
      setError(err.message);
    } finally {
      setRemovingId(null);
    }
  }

  return (
    <div className="course-card">
      {editing ? (
        <form onSubmit={handleSaveCourse} className="course-edit-form">
          <label>
            Название
            <input
              type="text"
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              required
            />
          </label>
          <label>
            Описание
            <input
              type="text"
              value={editDesc}
              onChange={(e) => setEditDesc(e.target.value)}
            />
          </label>
          <div className="course-edit-actions">
            <button type="submit" disabled={editSaving} className="btn btn-primary btn-small">
              {editSaving ? 'Сохранение…' : 'Сохранить'}
            </button>
            <button type="button" onClick={() => setEditing(false)} className="btn btn-secondary btn-small">
              Отмена
            </button>
          </div>
        </form>
      ) : (
        <>
          <div className="course-card-title">
            <h3>{course.name}</h3>
            <button type="button" onClick={startEdit} className="btn-link">Изменить курс</button>
          </div>
          {course.description && <p className="course-desc">{course.description}</p>}
        </>
      )}
      {error && <div className="auth-error">{error}</div>}
      <div className="course-members">
        <div className="course-members-block">
          <h4>Учителя</h4>
          <ul className="user-list user-list-with-remove">
            {courseTeachers.length === 0 ? (
              <li className="muted">Нет учителей</li>
            ) : courseTeachers.map((u) => (
              <li key={u.id}>
                <span>{u.email}{u.name ? ` — ${u.name}` : ''}</span>
                <button
                  type="button"
                  onClick={() => handleRemoveMember(u.id)}
                  disabled={removingId === u.id}
                  className="btn-remove"
                  title="Удалить с курса"
                >
                  {removingId === u.id ? '…' : 'Удалить'}
                </button>
              </li>
            ))}
          </ul>
          {teachersNotInCourse.length > 0 && (
            <form onSubmit={handleAddTeacher} className="form-inline form-small">
              <select value={addTeacherId} onChange={(e) => setAddTeacherId(e.target.value)} required>
                <option value="">Выберите учителя</option>
                {teachersNotInCourse.map((t) => (
                  <option key={t.id} value={t.id}>{t.email}{t.name ? ` (${t.name})` : ''}</option>
                ))}
              </select>
              <button type="submit" disabled={loading} className="btn btn-primary btn-small">Добавить</button>
            </form>
          )}
        </div>
        <div className="course-members-block">
          <h4>Студенты</h4>
          <ul className="user-list user-list-with-remove">
            {courseStudents.length === 0 ? (
              <li className="muted">Нет студентов</li>
            ) : courseStudents.map((u) => (
              <li key={u.id}>
                <span>{u.email}{u.name ? ` — ${u.name}` : ''}</span>
                <button
                  type="button"
                  onClick={() => handleRemoveMember(u.id)}
                  disabled={removingId === u.id}
                  className="btn-remove"
                  title="Удалить с курса"
                >
                  {removingId === u.id ? '…' : 'Удалить'}
                </button>
              </li>
            ))}
          </ul>
          {studentsNotInCourse.length > 0 && (
            <form onSubmit={handleAddStudent} className="form-inline form-small">
              <select value={addStudentId} onChange={(e) => setAddStudentId(e.target.value)} required>
                <option value="">Выберите студента</option>
                {studentsNotInCourse.map((s) => (
                  <option key={s.id} value={s.id}>{s.email}{s.name ? ` (${s.name})` : ''}</option>
                ))}
              </select>
              <button type="submit" disabled={loading} className="btn btn-primary btn-small">Добавить</button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

export default function AdminDashboard() {
  const { user } = useAuth();
  const [teachers, setTeachers] = useState([]);
  const [students, setStudents] = useState([]);
  const [courses, setCourses] = useState([]);
  const [courseName, setCourseName] = useState('');
  const [courseDesc, setCourseDesc] = useState('');
  const [courseSubmitting, setCourseSubmitting] = useState(false);
  const [courseError, setCourseError] = useState('');
  const [pendingPasswordChanges, setPendingPasswordChanges] = useState([]);
  const [acceptingId, setAcceptingId] = useState(null);
  const [acceptMessage, setAcceptMessage] = useState('');

  function loadAll() {
    api.getTeachers().then(setTeachers);
    api.getStudents().then(setStudents);
    api.getCourses().then(setCourses);
    api.getPendingPasswordChanges().then(setPendingPasswordChanges);
  }

  useEffect(() => {
    loadAll();
  }, []);

  async function handleCreateCourse(e) {
    e.preventDefault();
    setCourseError('');
    setCourseSubmitting(true);
    try {
      await api.createCourse(courseName.trim(), courseDesc.trim());
      setCourseName('');
      setCourseDesc('');
      setCourses(await api.getCourses());
    } catch (err) {
      setCourseError(err.message || 'Ошибка создания курса');
    } finally {
      setCourseSubmitting(false);
    }
  }

  async function handleAcceptPasswordChange(requestId) {
    setAcceptMessage('');
    setAcceptingId(requestId);
    try {
      const data = await api.acceptPasswordChange(requestId);
      setAcceptMessage(data.message || 'Пароль изменён. Пользователю отправлено уведомление «Кабылданды».');
      loadAll();
    } catch (err) {
      setAcceptMessage(err.message || 'Ошибка');
    } finally {
      setAcceptingId(null);
    }
  }

  return (
    <div className="dashboard-content">
      {acceptMessage && (
          <div className={acceptMessage.startsWith('Ошибка') ? 'auth-error' : 'auth-success'}>
            {acceptMessage}
          </div>
        )}

        {pendingPasswordChanges.length > 0 && (
          <section className="welcome-card">
            <h2>Запросы на смену пароля</h2>
            <p className="role-desc">Одобрите запрос — пароль пользователя будет изменён, ему придёт уведомление «Кабылданды».</p>
            <ul className="user-list">
              {pendingPasswordChanges.map((req) => (
                <li key={req.id}>
                  <span>
                    {req.User?.email}
                    {req.User?.name ? ` (${req.User.name})` : ''}
                    {' — '}
                    {formatDate(req.createdAt)}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleAcceptPasswordChange(req.id)}
                    disabled={acceptingId === req.id}
                    className="btn btn-primary btn-small"
                  >
                    {acceptingId === req.id ? '…' : 'Одобрить'}
                  </button>
                </li>
              ))}
            </ul>
          </section>
        )}

        <section className="welcome-card">
          <h2>Создать курс</h2>
          <p className="role-desc">Сначала создайте курс, затем назначьте на него учителей и студентов.</p>
          <form onSubmit={handleCreateCourse} className="form-inline">
            {courseError && <div className="auth-error">{courseError}</div>}
            <label>
              Название курса
              <input
                type="text"
                value={courseName}
                onChange={(e) => setCourseName(e.target.value)}
                required
                placeholder="Например: Математика 1"
              />
            </label>
            <label>
              Описание
              <input
                type="text"
                value={courseDesc}
                onChange={(e) => setCourseDesc(e.target.value)}
                placeholder="Необязательно"
              />
            </label>
            <button type="submit" disabled={courseSubmitting} className="btn btn-primary">
              {courseSubmitting ? 'Создание…' : 'Создать курс'}
            </button>
          </form>
        </section>

        <section className="welcome-card courses-section">
          <h2>Курсы</h2>
          {courses.length === 0 ? (
            <p className="muted">Нет курсов. Создайте курс выше.</p>
          ) : (
            <div className="course-cards">
              {courses.map((course) => (
                <CourseCard
                  key={course.id}
                  course={course}
                  teachers={teachers}
                  students={students}
                  onRefresh={loadAll}
                />
              ))}
            </div>
          )}
        </section>
        <p><Link to="/">На главную</Link></p>
    </div>
  );
}
