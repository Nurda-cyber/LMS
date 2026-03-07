import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import * as api from '../api/client';

export default function TeacherDashboard() {
  const { user, logout } = useAuth();
  const [courses, setCourses] = useState([]);

  useEffect(() => {
    api.getMyCourses().then(setCourses);
  }, []);

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <h1>LMS — Учитель</h1>
        <div className="dashboard-user">
          <span>{user?.name || user?.email}</span>
          <button type="button" onClick={logout} className="btn-logout">
            Выйти
          </button>
        </div>
      </header>
      <main className="dashboard-main">
        <div className="welcome-card">
          <h2>Мои курсы</h2>
          {user?.name && <p>Имя: {user.name}</p>}
          {courses.length === 0 ? (
            <p className="muted">Вас пока не назначили ни на один курс. Обратитесь к администратору.</p>
          ) : (
            <ul className="my-courses-list">
              {courses.map((c) => (
                <li key={c.id} className="my-course-item">
                  <span className="my-course-name">{c.name}</span>
                  {c.description && <span className="my-course-desc"> — {c.description}</span>}
                </li>
              ))}
            </ul>
          )}
          <Link to="/">На главную</Link>
        </div>
      </main>
    </div>
  );
}
