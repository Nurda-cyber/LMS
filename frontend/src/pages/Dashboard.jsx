import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';

export default function Dashboard() {
  const { user, logout } = useAuth();

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <h1>LMS</h1>
        <div className="dashboard-user">
          <span>{user?.name || user?.email}</span>
          <button type="button" onClick={logout} className="btn-logout">
            Выйти
          </button>
        </div>
      </header>
      <main className="dashboard-main">
        <div className="welcome-card">
          <h2>Добро пожаловать</h2>
          <p>Email: {user?.email}</p>
          {user?.name && <p>Имя: {user.name}</p>}
          <Link to="/">На главную</Link>
        </div>
      </main>
    </div>
  );
}
