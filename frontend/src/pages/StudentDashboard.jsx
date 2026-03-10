import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import * as api from '../api/client';

export default function StudentDashboard() {
  const { user } = useAuth();
  const [courses, setCourses] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [loadingNotifications, setLoadingNotifications] = useState(true);

  useEffect(() => {
    let cancelled = false;
    Promise.all([api.getMyCourses(), api.getNotifications()])
      .then(([coursesData, notificationsData]) => {
        if (cancelled) return;
        setCourses(coursesData || []);
        setNotifications(Array.isArray(notificationsData) ? notificationsData : []);
      })
      .finally(() => {
        if (!cancelled) {
          setLoadingNotifications(false);
        }
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const handleMarkRead = async (id) => {
    try {
      const updated = await api.markNotificationRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, ...updated } : n))
      );
    } catch {
      // тихо игнорируем для UX, можно добавить тостер
    }
  };

  const handleDelete = async (id) => {
    try {
      await api.deleteNotification(id);
      setNotifications((prev) => prev.filter((n) => n.id !== id));
    } catch {
      // тихо игнорируем
    }
  };

  return (
    <div className="dashboard-content">
      <div className="welcome-card">
        <h2>Уведомления</h2>
        {loadingNotifications ? (
          <p className="muted">Загрузка уведомлений…</p>
        ) : notifications.length === 0 ? (
          <p className="muted">У вас пока нет уведомлений.</p>
        ) : (
          <ul className="notifications-list">
            {notifications.map((n) => (
              <li
                key={n.id}
                className={`notification-item ${n.isRead ? 'notification-read' : 'notification-unread'}`}
              >
                <div className="notification-main">
                  <div className="notification-title-line">
                    <span className="notification-title">{n.title}</span>
                    {!n.isRead && <span className="notification-badge">Непрочитано</span>}
                  </div>
                  <div className="notification-message">{n.message}</div>
                  <div className="notification-meta">
                    <span className="notification-type">{n.type}</span>
                    <span className="notification-date">
                      {n.createdAt &&
                        new Date(n.createdAt).toLocaleString('ru-RU', {
                          day: '2-digit',
                          month: '2-digit',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                    </span>
                  </div>
                </div>
                <div className="notification-actions">
                  {!n.isRead && (
                    <button
                      type="button"
                      className="btn btn-secondary btn-sm"
                      onClick={() => handleMarkRead(n.id)}
                    >
                      Прочитано
                    </button>
                  )}
                  <button
                    type="button"
                    className="btn btn-link btn-sm"
                    onClick={() => handleDelete(n.id)}
                  >
                    Удалить
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

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
