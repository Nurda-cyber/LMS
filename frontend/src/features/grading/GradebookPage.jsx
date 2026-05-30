import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { http } from '../../shared/api/httpClient';
import { Card, EmptyState, Spinner } from '../../shared/ui';
import { CategoriesEditor } from './CategoriesEditor';
import { GradebookView } from './GradebookView';
import './grading.css';

/**
 * Страница «Ведомость» — выбор курса + редактор категорий + ведомость.
 * Предназначена для учителя/админа.
 */
export default function GradebookPage() {
  const coursesQuery = useQuery({
    queryKey: ['my-courses'],
    queryFn: () => http.get('/courses/my'),
  });

  const [courseId, setCourseId] = useState(null);

  const courses = useMemo(() => coursesQuery.data || [], [coursesQuery.data]);

  return (
    <div className="dashboard-content content-panel">
      <div className="gradebook-toolbar">
        <strong>Курс:</strong>
        <select
          value={courseId || ''}
          onChange={(e) => setCourseId(e.target.value ? Number(e.target.value) : null)}
        >
          <option value="">— выберите курс —</option>
          {courses.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
        {coursesQuery.isLoading && <Spinner size="sm" />}
      </div>

      {!courseId ? (
        <Card>
          <EmptyState
            title="Выберите курс"
            description="Сначала выберите курс из списка выше, чтобы настроить категории и увидеть ведомость."
          />
        </Card>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
          <CategoriesEditor courseId={courseId} />
          <GradebookView courseId={courseId} />
        </div>
      )}
    </div>
  );
}
