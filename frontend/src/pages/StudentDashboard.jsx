import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import * as api from '../api/client';

export default function StudentDashboard() {
  const { user } = useAuth();
  const [courses, setCourses] = useState([]);

  useEffect(() => {
    api.getMyCourses().then(setCourses);
  }, []);

  return (
    <div className="dashboard-content">
      <div className="welcome-card">
        <h2>Мои курсы</h2>
        <p className="role-desc">Информация о курсах, на которые вы записаны. Выберите «Курсы» в меню слева для просмотра.</p>
        {user?.name && <p>Имя: {user.name}</p>}
        {courses.length === 0 ? (
          <p className="muted">Вы пока не записаны ни на один курс. Администратор добавит вас на курс после регистрации.</p>
        ) : (
          <ul className="my-courses-list">
            {courses.map((c) => (
              <li key={c.id} className="my-course-item">
                <span className="my-course-name">{c.name}</span>
                {c.description && <span className="my-course-desc"> — {c.description}</span>}
                {(c.assignments || []).length > 0 && (
                  <ul className="my-assignments-list">
                    {c.assignments.map((a) => (
                      <li key={a.id} className="my-assignment-item">
                        <span className="assignment-title">{a.title}</span>
                        {a.description && <span className="assignment-desc-inline"> — {a.description}</span>}
                        {a.dueAt && (
                          <span className="assignment-due-inline">
                            {' '}· Срок: {new Date(a.dueAt).toLocaleString('ru-RU', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                          </span>
                        )}
                        {a.mySubmittedAt && <span className="my-grade submitted-inline">Отправлено</span>}
                        {a.myGrade != null && a.myGrade !== '' ? (
                          <span className="my-grade">Оценка: <strong>{a.myGrade}</strong></span>
                        ) : a.mySubmittedAt ? (
                          <span className="my-grade muted">Оценка не выставлена</span>
                        ) : null}
                        {a.myGradeComment && (
                          <span className="my-grade-comment">Комментарий: {a.myGradeComment}</span>
                        )}
                      </li>
                    ))}
                  </ul>
                )}
              </li>
            ))}
          </ul>
        )}
        <Link to="/">На главную</Link>
      </div>
    </div>
  );
}
