import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCourseSidebar } from '../context/CourseSidebarContext';
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

export default function AssignmentsPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { setSelectedCourseId } = useCourseSidebar();
  const role = user?.role || 'student';
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [data, setData] = useState(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError('');
    const load = async () => {
      try {
        if (role === 'student') {
          const res = await api.getDashboardStudent();
          if (!cancelled) setData({ type: 'student', ...res });
        } else if (role === 'teacher') {
          const res = await api.getDashboardTeacher();
          if (!cancelled) setData({ type: 'teacher', ...res });
        } else {
          const courses = await api.getCourses();
          if (!cancelled) setData({ type: 'admin', courses: courses || [] });
        }
      } catch (err) {
        if (!cancelled) setError(err.message || 'Ошибка загрузки');
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    return () => { cancelled = true; };
  }, [role]);

  if (loading) {
    return (
      <div className="dashboard-content content-panel">
        <div className="welcome-card content-panel-card">
          <p className="muted">Загрузка заданий…</p>
        </div>
      </div>
    );
  }
  if (error) {
    return (
      <div className="dashboard-content content-panel">
        <div className="welcome-card content-panel-card">
          <p className="auth-error">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-content content-panel">
      <div className="welcome-card content-panel-card">
        <h2>Задания</h2>
        {data?.type === 'student' && (
          <>
            {(!data.assignments || data.assignments.length === 0) ? (
              <p className="muted">Нет заданий по вашим курсам.</p>
            ) : (
              <ul className="assignments-page-list">
                {data.assignments.map((a) => {
                  const course = (data.courses || []).find((c) => c.id === a.courseId);
                  return (
                    <li key={a.id} className="assignments-page-item">
                      <span className="assignments-page-course">{course?.name || 'Курс'}</span>
                      <span className="assignments-page-title">{a.title}</span>
                      {a.dueAt && (
                        <span className="assignments-page-due">Срок: {formatDate(a.dueAt)}</span>
                      )}
                      <button
                        type="button"
                        className="btn btn-secondary btn-sm"
                        onClick={() => {
                          setSelectedCourseId(a.courseId);
                          navigate('/dashboard');
                        }}
                      >
                        Открыть в курсе
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </>
        )}
        {data?.type === 'teacher' && (
          <>
            <p className="role-desc">
              Всего заданий: <strong>{data.assignments ?? 0}</strong>.
              Ожидают проверки: <strong>{data.pending_submissions ?? 0}</strong>.
            </p>
            {(!data.courses || data.courses.length === 0) ? (
              <p className="muted">Нет курсов.</p>
            ) : (
              <ul className="assignments-page-courses">
                {data.courses.map((c) => (
                  <li key={c.id}>
                    <button
                      type="button"
                      className="btn btn-secondary"
                      onClick={() => {
                        setSelectedCourseId(c.id);
                        navigate('/dashboard');
                      }}
                    >
                      {c.name} — задания и оценки
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </>
        )}
        {data?.type === 'admin' && (
          <>
            <p className="role-desc">Курсы системы. Выберите курс для заданий и оценок.</p>
            {(!data.courses || data.courses.length === 0) ? (
              <p className="muted">Нет курсов.</p>
            ) : (
              <ul className="assignments-page-courses">
                {data.courses.map((c) => (
                  <li key={c.id}>
                    <button
                      type="button"
                      className="btn btn-secondary"
                      onClick={() => {
                        setSelectedCourseId(c.id);
                        navigate('/dashboard');
                      }}
                    >
                      {c.name}
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </>
        )}
      </div>
    </div>
  );
}
