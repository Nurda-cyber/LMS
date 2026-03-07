import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Home() {
  const { user } = useAuth();

  return (
    <div className="home">
      <div className="home-card">
        <h1>LMS</h1>
        <p className="home-desc">React + Node.js + PostgreSQL</p>
        {user ? (
          <div className="home-actions">
            <Link to="/dashboard" className="btn btn-primary">
              {user.role === 'admin' ? 'Панель администратора' : user.role === 'teacher' ? 'Панель учителя' : 'Личный кабинет'}
            </Link>
          </div>
        ) : (
          <div className="home-actions">
            <Link to="/login" className="btn btn-primary">
              Войти
            </Link>
            <Link to="/register" className="btn btn-secondary">
              Регистрация студента
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
