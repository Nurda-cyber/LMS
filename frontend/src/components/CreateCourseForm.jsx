import { useState } from 'react';
import * as api from '../api/client';
import { useCourseSidebar } from '../context/CourseSidebarContext';

export default function CreateCourseForm() {
  const { refreshCourses, setSelectedCourseId, closeCreateCourse } = useCourseSidebar();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    const trimmedName = name.trim();
    if (!trimmedName) return;
    setError('');
    setLoading(true);
    try {
      const course = await api.createCourse(trimmedName, description.trim());
      setName('');
      setDescription('');
      refreshCourses();
      setSelectedCourseId(course.id);
      closeCreateCourse();
    } catch (err) {
      setError(err.message || 'Ошибка создания курса');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="dashboard-content content-panel">
      <div className="welcome-card content-panel-card">
        <h2>Создать курс</h2>
        <p className="role-desc">Укажите название и описание нового курса.</p>
        <form onSubmit={handleSubmit} className="auth-form form-inline">
          {error && <div className="auth-error">{error}</div>}
          <label>
            Название курса
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Например: Математика 1"
              required
              autoFocus
            />
          </label>
          <label>
            Описание
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Необязательно"
            />
          </label>
          <div className="form-actions">
            <button type="submit" disabled={loading} className="btn btn-primary">
              {loading ? 'Создание…' : 'Создать курс'}
            </button>
            <button type="button" onClick={closeCreateCourse} className="btn btn-secondary">
              Отмена
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
