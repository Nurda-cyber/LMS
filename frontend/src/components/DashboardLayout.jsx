import { useState, useEffect, useRef } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import * as api from '../api/client';

const ICON_COURSES = (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
    <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
    <path d="M8 7h8" />
    <path d="M8 11h8" />
  </svg>
);

const ICON_PROFILE = (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
);

const ICON_BELL = (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
    <path d="M13.73 21a2 2 0 0 1-3.46 0" />
  </svg>
);

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

export default function DashboardLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [bellOpen, setBellOpen] = useState(false);
  const [avatarOpen, setAvatarOpen] = useState(false);
  const bellRef = useRef(null);
  const avatarRef = useRef(null);

  const unreadCount = notifications.filter((n) => !n.read).length;

  function loadNotifications() {
    api.getNotifications().then(setNotifications);
  }

  useEffect(() => {
    loadNotifications();
  }, []);

  // Открыть колокольчик (панель уведомлений), если есть непрочитанные
  useEffect(() => {
    if (unreadCount > 0) setBellOpen(true);
  }, [unreadCount]);

  useEffect(() => {
    function handleClickOutside(e) {
      if (
        bellRef.current && !bellRef.current.contains(e.target) &&
        avatarRef.current && !avatarRef.current.contains(e.target)
      ) {
        setBellOpen(false);
        setAvatarOpen(false);
      }
    }
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  async function handleMarkRead(id) {
    try {
      await api.markNotificationRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, read: true } : n))
      );
    } catch (_) {}
  }

  function handleLogout() {
    setAvatarOpen(false);
    logout();
    navigate('/');
  }

  const initial = (user?.name || user?.email || '?').charAt(0).toUpperCase();

  return (
    <div className="dashboard-layout">
      <aside className="dashboard-sidebar">
        <div className="sidebar-accent" />
        <div className="sidebar-brand">LMS</div>
        <nav className="sidebar-nav">
          <NavLink
            to="/dashboard"
            end
            className={({ isActive }) => `sidebar-item ${isActive ? 'active' : ''}`}
            title="Курсы"
          >
            {ICON_COURSES}
            <span className="sidebar-item-label">Курсы</span>
          </NavLink>
          <NavLink
            to="/dashboard/profile"
            className={({ isActive }) => `sidebar-item ${isActive ? 'active' : ''}`}
            title="Профиль"
          >
            {ICON_PROFILE}
            <span className="sidebar-item-label">Профиль</span>
          </NavLink>
        </nav>
      </aside>

      <div className="dashboard-body">
        <header className="dashboard-topbar">
          <div className="topbar-spacer" />
          <div className="topbar-actions">
            <div className="topbar-bell-wrap" ref={bellRef}>
              <button
                type="button"
                className="topbar-bell"
                onClick={() => { setBellOpen((v) => !v); setAvatarOpen(false); }}
                aria-label="Уведомления"
              >
                {ICON_BELL}
                {unreadCount > 0 && (
                  <span className="topbar-bell-badge">{unreadCount > 99 ? '99+' : unreadCount}</span>
                )}
              </button>
              {bellOpen && (
                <div className="topbar-dropdown topbar-dropdown-notifications">
                  <div className="topbar-dropdown-title">Уведомления</div>
                  {notifications.length === 0 ? (
                    <p className="muted">Нет уведомлений</p>
                  ) : (
                    <ul className="notifications-dropdown-list">
                      {notifications.slice(0, 10).map((n) => (
                        <li key={n.id} className={n.read ? '' : 'unread'}>
                          <span className="notif-msg">{n.message}</span>
                          <span className="notif-date">{formatDate(n.createdAt)}</span>
                          {!n.read && (
                            <button type="button" onClick={() => handleMarkRead(n.id)} className="btn-link btn-small">
                              Прочитано
                            </button>
                          )}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              )}
            </div>
            <div className="topbar-avatar-wrap" ref={avatarRef}>
              <button
                type="button"
                className="topbar-avatar"
                onClick={() => { setAvatarOpen((v) => !v); setBellOpen(false); }}
                aria-label="Профиль"
              >
                <span className="avatar-circle">{initial}</span>
                <span className="avatar-status" />
              </button>
              {avatarOpen && (
                <div className="topbar-dropdown topbar-dropdown-profile">
                  <div className="topbar-dropdown-user">{user?.name || user?.email}</div>
                  <button
                    type="button"
                    className="topbar-dropdown-item"
                    onClick={() => { setAvatarOpen(false); navigate('/dashboard/profile'); }}
                  >
                    Профиль
                  </button>
                  <button type="button" className="topbar-dropdown-item topbar-dropdown-logout" onClick={handleLogout}>
                    Выйти
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>
        <main className="dashboard-main">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
