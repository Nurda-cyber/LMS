import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import * as api from '../api/client';

const ROLE_LABELS = { admin: 'Администратор', teacher: 'Учитель', student: 'Студент' };

function formatDate(iso) {
  if (!iso) return '—';
  try {
    return new Date(iso).toLocaleString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch {
    return iso;
  }
}

export default function Profile() {
  const { user, logout } = useAuth();
  const [profile, setProfile] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [repeatPassword, setRepeatPassword] = useState('');
  const [passwordSubmitting, setPasswordSubmitting] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');

  function loadProfile() {
    api.getMe().then((data) => {
      setProfile(data);
    });
  }

  function loadNotifications() {
    api.getNotifications().then(setNotifications);
  }

  useEffect(() => {
    loadProfile();
    loadNotifications();
  }, []);

  async function handlePasswordSubmit(e) {
    e.preventDefault();
    setPasswordError('');
    setPasswordSuccess('');
    if (newPassword !== repeatPassword) {
      setPasswordError('Новый пароль и повтор не совпадают');
      return;
    }
    if (newPassword.length < 6) {
      setPasswordError('Пароль должен быть не короче 6 символов');
      return;
    }
    setPasswordSubmitting(true);
    try {
      await api.requestPasswordChange(currentPassword, newPassword);
      setPasswordSuccess('Запрос на смену пароля отправлен администратору. После одобрения вы получите уведомление.');
      setCurrentPassword('');
      setNewPassword('');
      setRepeatPassword('');
    } catch (err) {
      setPasswordError(err.message || 'Ошибка отправки запроса');
    } finally {
      setPasswordSubmitting(false);
    }
  }

  async function handleMarkRead(id) {
    try {
      await api.markNotificationRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, read: true } : n))
      );
    } catch (_) {}
  }

  const displayUser = profile || user;

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <h1>LMS — Профиль</h1>
        <div className="dashboard-user">
          <span>{displayUser?.name || displayUser?.email}</span>
          <Link to="/dashboard" className="btn-link">В дашборд</Link>
          <button type="button" onClick={logout} className="btn-logout">
            Выйти
          </button>
        </div>
      </header>
      <main className="dashboard-main">
        <section className="welcome-card">
          <h2>Информация о себе</h2>
          {displayUser ? (
            <ul className="profile-info">
              <li><strong>Email:</strong> {displayUser.email}</li>
              <li><strong>Имя:</strong> {displayUser.name || '—'}</li>
              <li><strong>Роль:</strong> {ROLE_LABELS[displayUser.role] || displayUser.role}</li>
              <li><strong>Дата регистрации:</strong> {formatDate(displayUser.createdAt)}</li>
            </ul>
          ) : (
            <p className="muted">Загрузка…</p>
          )}
        </section>

        <section className="welcome-card">
          <h2>Смена пароля</h2>
          <p className="role-desc">
            Запрос на смену пароля будет отправлен администратору. После одобрения вы получите уведомление «Кабылданды» (одобрено).
          </p>
          <form onSubmit={handlePasswordSubmit} className="auth-form">
            {passwordError && <div className="auth-error">{passwordError}</div>}
            {passwordSuccess && <div className="auth-success">{passwordSuccess}</div>}
            <label>
              Текущий пароль
              <input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                required
                autoComplete="current-password"
              />
            </label>
            <label>
              Новый пароль
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                minLength={6}
                autoComplete="new-password"
              />
            </label>
            <label>
              Повторите новый пароль
              <input
                type="password"
                value={repeatPassword}
                onChange={(e) => setRepeatPassword(e.target.value)}
                required
                minLength={6}
                autoComplete="new-password"
              />
            </label>
            <button type="submit" disabled={passwordSubmitting} className="btn btn-primary">
              {passwordSubmitting ? 'Отправка…' : 'Отправить запрос администратору'}
            </button>
          </form>
        </section>

        <section className="welcome-card">
          <h2>Уведомления</h2>
          {notifications.length === 0 ? (
            <p className="muted">Нет уведомлений</p>
          ) : (
            <ul className="notifications-list">
              {notifications.map((n) => (
                <li key={n.id} className={n.read ? 'notification-read' : 'notification-unread'}>
                  <span className="notification-message">{n.message}</span>
                  <span className="notification-date">{formatDate(n.createdAt)}</span>
                  {!n.read && (
                    <button
                      type="button"
                      onClick={() => handleMarkRead(n.id)}
                      className="btn-link btn-small"
                    >
                      Прочитано
                    </button>
                  )}
                </li>
              ))}
            </ul>
          )}
        </section>

        <p><Link to="/dashboard">На дашборд</Link></p>
      </main>
    </div>
  );
}
