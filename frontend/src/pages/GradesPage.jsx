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

export default function GradesPage() {
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
          if (!cancelled) setData({ type: 'admin', courses: courses || [], pending_submissions: 0 });
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
          <p className="muted">Загрузка оценок…</p>
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
        <h2>Оценки</h2>
        {data?.type === 'student' && (
          <>
            {(!data.grades || data.grades.length === 0) ? (
              <p className="muted">У вас пока нет выставленных оценок.</p>
            ) : (
              <ul className="grades-page-list">
                {data.grades.map((g) => (
                  <li key={g.id} className="grades-page-item">
                    <span className="grades-page-assignment">{g.assignmentTitle || 'Задание'}</span>
                    <span className="grades-page-grade">
                      {g.grade != null && g.grade !== '' ? (
                        <strong>Оценка: {g.grade}</strong>
                      ) : (
                        <span className="muted">Оценка не выставлена</span>
                      )}
                    </span>
                    {g.comment && <span className="grades-page-comment">{g.comment}</span>}
                    <span className="grades-page-date">{formatDate(g.updatedAt)}</span>
                  </li>
                ))}
              </ul>
            )}
          </>
        )}
        {data?.type === 'teacher' && (
          <>
            <p className="role-desc">
              Работ на проверке: <strong>{data.pending_submissions ?? 0}</strong>.
            </p>
            {(!data.courses || data.courses.length === 0) ? (
              <p className="muted">Нет курсов.</p>
            ) : (
              <ul className="grades-page-courses">
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
                      {c.name} — выставить оценки
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </>
        )}
        {data?.type === 'admin' && (
          <>
            <p className="role-desc">Выберите курс для просмотра и выставления оценок.</p>
            {(!data.courses || data.courses.length === 0) ? (
              <p className="muted">Нет курсов.</p>
            ) : (
              <ul className="grades-page-courses">
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
