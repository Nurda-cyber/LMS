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
              </li>
            ))}
          </ul>
        )}
        <Link to="/">На главную</Link>
      </div>
    </div>
  );
}
