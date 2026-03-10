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
  const [assignDueAt, setAssignDueAt] = useState('');
  const [assignSubmitting, setAssignSubmitting] = useState(false);
  const [gradeInputs, setGradeInputs] = useState({});
  const [savingGrades, setSavingGrades] = useState(false);
  const [deletingAssignId, setDeletingAssignId] = useState(null);
  const [submissionsByAssignment, setSubmissionsByAssignment] = useState({});

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
      await api.createAssignment(course.id, assignTitle.trim(), assignDesc.trim(), assignDueAt || null);
      setAssignTitle('');
      setAssignDesc('');
      setAssignDueAt('');
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

  function getGradeSubmissionFor(assignment, userId) {
    const g = (assignment.grades || []).find((gr) => Number(gr.userId) === Number(userId));
    return g ? g.submissionText || '' : '';
  }

  function getFileSubmissionFor(assignmentId, userId) {
    const list = submissionsByAssignment[assignmentId] || [];
    return list.find((s) => Number(s.studentId) === Number(userId)) || null;
  }

  useEffect(() => {
    if (!course?.id || !assignments?.length) return;
    let cancelled = false;
    const load = async () => {
      const byId = {};
      for (const a of assignments) {
        try {
          const list = await api.getAssignmentSubmissions(a.id);
          if (!cancelled) byId[a.id] = list;
        } catch {
          if (!cancelled) byId[a.id] = [];
        }
      }
      if (!cancelled) setSubmissionsByAssignment(byId);
    };
    load();
    return () => { cancelled = true; };
  }, [course?.id, assignments?.length, assignments?.map((a) => a.id).join(',')]);

  async function handleSaveAllGrades() {
    setSavingGrades(true);
    setError('');
    try {
      for (const a of assignments) {
        for (const stu of courseStudents) {
          const key = `${a.id}-${stu.id}`;
          const commentKey = `comment-${a.id}-${stu.id}`;
          const grade = gradeInputs[key] !== undefined ? gradeInputs[key] : getGradeFor(a, stu.id);
          const comment = gradeInputs[commentKey] !== undefined ? gradeInputs[commentKey] : getGradeCommentFor(a, stu.id);
          const gradeStr = String(grade ?? '').trim();
          if (gradeStr !== '') {
            await api.setAssignmentGrade(course.id, a.id, stu.id, gradeStr, (comment || '').trim());
          }
        }
      }
      onRefresh();
    } catch (err) {
      setError(err.message);
    } finally {
      setSavingGrades(false);
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
          <form onSubmit={handleAddAssignment} className="form-inline form-small assignment-add-form">
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
            <label>
              Крайний срок (необяз.)
              <input
                type="datetime-local"
                value={assignDueAt}
                onChange={(e) => setAssignDueAt(e.target.value)}
                title="Дата и время сдачи"
              />
            </label>
            <button type="submit" disabled={assignSubmitting} className="btn btn-primary btn-small">
              {assignSubmitting ? '…' : 'Добавить задание'}
            </button>
          </form>
        )}
        {assignments.length > 0 && (
          <>
            {canManageAssignments && (
              <ul className="assignments-titles-list">
                {assignments.map((a) => (
                  <li key={a.id} className="assignment-title-row">
                    <span className="assignment-title-text">{a.title}</span>
                    {a.description && <span className="assignment-desc-inline"> — {a.description}</span>}
                    {a.dueAt && (
                      <span className="assignment-due-inline" title="Крайний срок">
                        {' '}· Срок: {formatDate(a.dueAt)}
                      </span>
                    )}
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
                  </li>
                ))}
              </ul>
            )}
            <div className="grades-table-wrap">
              <table className="grades-table">
                <thead>
                  <tr>
                    <th className="grades-th-student">Учащийся</th>
                    {assignments.map((a) => (
                      <th key={a.id} className="grades-th-assignment">{a.title}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {courseStudents.length === 0 ? (
                    <tr>
                      <td colSpan={assignments.length + 1} className="grades-empty">
                        {canManageAssignments ? 'Нет студентов на курсе. Добавьте студентов для выставления оценок.' : 'Нет студентов.'}
                      </td>
                    </tr>
                  ) : (
                    courseStudents.map((stu) => (
                      <tr key={stu.id}>
                        <td className="grades-td-student">{stu.name || stu.email}{stu.name && stu.email ? ` (${stu.email})` : ''}</td>
                        {assignments.map((a) => {
                          const key = `${a.id}-${stu.id}`;
                          const commentKey = `comment-${a.id}-${stu.id}`;
                          const currentGrade = getGradeFor(a, stu.id);
                          const currentComment = getGradeCommentFor(a, stu.id);
                          const submissionText = getGradeSubmissionFor(a, stu.id);
                          if (!canManageAssignments) {
                            return (
                              <td key={a.id} className="grades-td-cell grades-td-readonly">
                                {currentGrade || '—'}
                                {currentComment && <span className="grade-comment-inline" title={currentComment}> *</span>}
                              </td>
                            );
                          }
                          const inputVal = gradeInputs[key] !== undefined ? gradeInputs[key] : currentGrade;
                          const commentVal = gradeInputs[commentKey] !== undefined ? gradeInputs[commentKey] : currentComment;
                          const fileSubmission = getFileSubmissionFor(a.id, stu.id);
                          return (
                            <td key={a.id} className="grades-td-cell">
                              <input
                                type="text"
                                className="grade-input grades-input"
                                placeholder="Оценка"
                                value={inputVal}
                                onChange={(e) => setGradeInputs((prev) => ({ ...prev, [key]: e.target.value }))}
                                title={commentVal ? `Комментарий: ${commentVal}` : ''}
                              />
                              <input
                                type="text"
                                className="grade-comment-input grades-comment-input"
                                placeholder="Комм."
                                value={commentVal}
                                onChange={(e) => setGradeInputs((prev) => ({ ...prev, [commentKey]: e.target.value }))}
                              />
                              {fileSubmission?.fileUrl ? (
                                <a
                                  href={fileSubmission.fileUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="grade-file-link"
                                >
                                  Скачать файл
                                </a>
                              ) : null}
                              {submissionText ? (
                                <div className="grade-submission-preview" title={submissionText}>
                                  Ответ: {submissionText.length > 80 ? `${submissionText.slice(0, 80)}…` : submissionText}
                                </div>
                              ) : null}
                            </td>
                          );
                        })}
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
            {canManageAssignments && courseStudents.length > 0 && (
              <div className="grades-save-row">
                <button
                  type="button"
                  onClick={handleSaveAllGrades}
                  disabled={savingGrades}
                  className="btn btn-primary btn-save-grades"
                >
                  {savingGrades ? 'Сохранение…' : 'Сохранить'}
                </button>
              </div>
            )}
          </>
        )}
        {assignments.length === 0 && (
          <p className="muted">{canManageAssignments ? 'Нет заданий. Добавьте задание выше.' : 'Нет заданий.'}</p>
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
