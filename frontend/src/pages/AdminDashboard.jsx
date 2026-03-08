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

function CourseCard({ course, teachers, students, assignments = [], onRefresh, canManageAssignments = false, showMembersManagement = true, showCourseEdit = true }) {
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
  const [assignTitle, setAssignTitle] = useState('');
  const [assignDesc, setAssignDesc] = useState('');
  const [assignSubmitting, setAssignSubmitting] = useState(false);
  const [gradeInputs, setGradeInputs] = useState({});
  const [savingAssignmentId, setSavingAssignmentId] = useState(null);
  const [deletingAssignId, setDeletingAssignId] = useState(null);

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

  async function handleAddAssignment(e) {
    e.preventDefault();
    if (!assignTitle.trim()) return;
    setError('');
    setAssignSubmitting(true);
    try {
      await api.createAssignment(course.id, assignTitle.trim(), assignDesc.trim());
      setAssignTitle('');
      setAssignDesc('');
      onRefresh();
    } catch (err) {
      setError(err.message);
    } finally {
      setAssignSubmitting(false);
    }
  }

  async function handleDeleteAssignment(assignmentId) {
    setDeletingAssignId(assignmentId);
    setError('');
    try {
      await api.deleteAssignment(course.id, assignmentId);
      onRefresh();
    } catch (err) {
      setError(err.message);
    } finally {
      setDeletingAssignId(null);
    }
  }

  function getGradeFor(assignment, userId) {
    const g = (assignment.grades || []).find((gr) => Number(gr.userId) === Number(userId));
    return g ? g.grade : '';
  }

  function getGradeCommentFor(assignment, userId) {
    const g = (assignment.grades || []).find((gr) => Number(gr.userId) === Number(userId));
    return g ? g.comment || '' : '';
  }

  async function handleSaveAllGradesForAssignment(assignmentId) {
    setSavingAssignmentId(assignmentId);
    setError('');
    try {
      const assignment = assignments.find((a) => a.id === assignmentId);
      for (const stu of courseStudents) {
        const key = `${assignmentId}-${stu.id}`;
        const commentKey = `comment-${assignmentId}-${stu.id}`;
        const grade = gradeInputs[key] !== undefined ? gradeInputs[key] : getGradeFor(assignment, stu.id);
        const comment = gradeInputs[commentKey] !== undefined ? gradeInputs[commentKey] : getGradeCommentFor(assignment, stu.id);
        const gradeStr = String(grade ?? '').trim();
        if (gradeStr !== '') {
          await api.setAssignmentGrade(course.id, assignmentId, stu.id, gradeStr, (comment || '').trim());
        }
      }
      onRefresh();
    } catch (err) {
      setError(err.message);
    } finally {
      setSavingAssignmentId(null);
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
            {showCourseEdit && (
              <button type="button" onClick={startEdit} className="btn-link">Изменить курс</button>
            )}
          </div>
          {course.description && <p className="course-desc">{course.description}</p>}
        </>
      )}
      {error && <div className="auth-error">{error}</div>}
      {showMembersManagement && (
        <div className="course-members">
          <div className="course-members-block">
            <h4>Учителя</h4>
            <ul className={`user-list ${showMembersManagement ? 'user-list-with-remove' : ''}`}>
              {courseTeachers.length === 0 ? (
                <li className="muted">Нет учителей</li>
              ) : courseTeachers.map((u) => (
                <li key={u.id}>
                  <span>{u.email}{u.name ? ` — ${u.name}` : ''}</span>
                  {showMembersManagement && (
                    <button
                      type="button"
                      onClick={() => handleRemoveMember(u.id)}
                      disabled={removingId === u.id}
                      className="btn-remove"
                      title="Удалить с курса"
                    >
                      {removingId === u.id ? '…' : 'Удалить'}
                    </button>
                  )}
                </li>
              ))}
            </ul>
            {showMembersManagement && teachersNotInCourse.length > 0 && (
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
            <ul className={`user-list ${showMembersManagement ? 'user-list-with-remove' : ''}`}>
              {courseStudents.length === 0 ? (
                <li className="muted">Нет студентов</li>
              ) : courseStudents.map((u) => (
                <li key={u.id}>
                  <span>{u.email}{u.name ? ` — ${u.name}` : ''}</span>
                  {showMembersManagement && (
                    <button
                      type="button"
                      onClick={() => handleRemoveMember(u.id)}
                      disabled={removingId === u.id}
                      className="btn-remove"
                      title="Удалить с курса"
                    >
                      {removingId === u.id ? '…' : 'Удалить'}
                    </button>
                  )}
                </li>
              ))}
            </ul>
            {showMembersManagement && studentsNotInCourse.length > 0 && (
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
      )}

      <div className="course-assignments">
        <h4>Задания</h4>
        {canManageAssignments && (
          <form onSubmit={handleAddAssignment} className="form-inline form-small">
            <label>
              Название задания
              <input
                type="text"
                value={assignTitle}
                onChange={(e) => setAssignTitle(e.target.value)}
                placeholder="Например: Домашняя работа 1"
                required
              />
            </label>
            <label>
              Описание (необяз.)
              <input
                type="text"
                value={assignDesc}
                onChange={(e) => setAssignDesc(e.target.value)}
                placeholder="Краткое описание"
              />
            </label>
            <button type="submit" disabled={assignSubmitting} className="btn btn-primary btn-small">
              {assignSubmitting ? '…' : 'Добавить задание'}
            </button>
          </form>
        )}
        {assignments.length === 0 ? (
          <p className="muted">{canManageAssignments ? 'Нет заданий. Добавьте задание выше.' : 'Нет заданий.'}</p>
        ) : (
          <ul className="assignments-list">
            {assignments.map((a) => (
              <li key={a.id} className="assignment-item">
                <div className="assignment-item-head">
                  <strong>{a.title}</strong>
                  {a.description && <span className="assignment-desc"> — {a.description}</span>}
                  {canManageAssignments && (
                    <button
                      type="button"
                      onClick={() => handleDeleteAssignment(a.id)}
                      disabled={deletingAssignId === a.id}
                      className="btn-remove btn-small"
                    >
                      {deletingAssignId === a.id ? '…' : 'Удалить'}
                    </button>
                  )}
                </div>
                {courseStudents.length === 0 ? (
                  <p className="muted">{canManageAssignments ? 'Нет студентов на курсе — добавьте студентов, чтобы выставлять оценки.' : 'Нет студентов.'}</p>
                ) : (
                  <ul className="assignment-grades-list">
                    {courseStudents.map((stu) => {
                      const key = `${a.id}-${stu.id}`;
                      const commentKey = `comment-${a.id}-${stu.id}`;
                      const currentGrade = getGradeFor(a, stu.id);
                      const currentComment = getGradeCommentFor(a, stu.id);
                      if (!canManageAssignments) {
                        return (
                          <li key={stu.id} className="grade-row grade-row-readonly">
                            <span className="grade-student">{stu.email}{stu.name ? ` (${stu.name})` : ''}</span>
                            <span className="grade-value">Оценка: {currentGrade || '—'}</span>
                            {currentComment && <span className="grade-comment-value">{currentComment}</span>}
                          </li>
                        );
                      }
                      const inputVal = gradeInputs[key] !== undefined ? gradeInputs[key] : currentGrade;
                      const commentVal = gradeInputs[commentKey] !== undefined ? gradeInputs[commentKey] : currentComment;
                      return (
                        <li key={stu.id} className="grade-row">
                          <span className="grade-student">{stu.email}{stu.name ? ` (${stu.name})` : ''}</span>
                          <input
                            type="text"
                            className="grade-input"
                            placeholder="Оценка"
                            value={inputVal}
                            onChange={(e) => setGradeInputs((prev) => ({ ...prev, [key]: e.target.value }))}
                          />
                          <input
                            type="text"
                            className="grade-comment-input"
                            placeholder="Комментарий"
                            value={commentVal}
                            onChange={(e) => setGradeInputs((prev) => ({ ...prev, [commentKey]: e.target.value }))}
                          />
                        </li>
                      );
                    })}
                  </ul>
                )}
                {canManageAssignments && courseStudents.length > 0 && (
                  <div className="assignment-save-row">
                    <button
                      type="button"
                      onClick={() => handleSaveAllGradesForAssignment(a.id)}
                      disabled={savingAssignmentId === a.id}
                      className="btn btn-primary btn-save-grades"
                    >
                      {savingAssignmentId === a.id ? 'Сохранение…' : 'Сохранить оценки'}
                    </button>
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

export { CourseCard };

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
  const [courseAssignments, setCourseAssignments] = useState({});

  async function loadAll() {
    const [teachersData, studentsData, coursesData, pendingData] = await Promise.all([
      api.getTeachers(),
      api.getStudents(),
      api.getCourses(),
      api.getPendingPasswordChanges()
    ]);
    setTeachers(teachersData);
    setStudents(studentsData);
    setCourses(coursesData);
    setPendingPasswordChanges(pendingData);
    const assignArrays = await Promise.all((coursesData || []).map((c) => api.getCourseAssignments(c.id)));
    const assignMap = {};
    (coursesData || []).forEach((c, i) => {
      assignMap[c.id] = assignArrays[i] || [];
    });
    setCourseAssignments(assignMap);
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
                  assignments={courseAssignments[course.id] || []}
                  onRefresh={loadAll}
                  canManageAssignments={false}
                  showMembersManagement={true}
                  showCourseEdit={true}
                />
              ))}
            </div>
          )}
        </section>
        <p><Link to="/">На главную</Link></p>
    </div>
  );
}
