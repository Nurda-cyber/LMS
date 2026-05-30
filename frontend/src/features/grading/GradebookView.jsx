import { useMemo } from 'react';
import { RefreshCw } from 'lucide-react';
import { Button, Card, EmptyState, Spinner } from '../../shared/ui';
import { notify } from '../../shared/lib/notify';
import { useGradebook, useRecalculate } from './hooks';

/**
 * Полная ведомость курса: студенты × задания + итоговая оценка.
 * Поддерживает пересчёт итоговых оценок одной кнопкой.
 */
export function GradebookView({ courseId }) {
  const { data, isLoading, isError, error } = useGradebook(courseId);
  const recalc = useRecalculate(courseId);

  const indexByStudent = useMemo(() => {
    if (!data) return new Map();
    const m = new Map();
    for (const g of data.grades || []) {
      const key = `${g.userId}:${g.assignmentId}`;
      m.set(key, g);
    }
    return m;
  }, [data]);

  const finalsByStudent = useMemo(() => {
    if (!data) return new Map();
    const m = new Map();
    for (const f of data.finals || []) m.set(f.studentId, f);
    return m;
  }, [data]);

  if (isLoading) {
    return <Card title="Ведомость"><Spinner /></Card>;
  }

  if (isError) {
    return <Card title="Ведомость"><EmptyState title="Ошибка" description={error?.message} /></Card>;
  }

  if (!data || data.students.length === 0) {
    return <Card title="Ведомость"><EmptyState title="Нет студентов" description="Запишите студентов на курс." /></Card>;
  }

  async function handleRecalc(finalize = false) {
    try {
      const res = await recalc.mutateAsync({ finalize });
      notify.success(`Пересчитано: ${res.count} студ.`);
    } catch (err) {
      notify.fromError(err);
    }
  }

  return (
    <Card
      title="Ведомость курса"
      subtitle="Текущие баллы по заданиям и итоговая оценка по каждому студенту."
      actions={
        <>
          <Button variant="secondary" leftIcon={<RefreshCw size={14} />} onClick={() => handleRecalc(false)} loading={recalc.isPending}>
            Пересчитать
          </Button>
          <Button variant="primary" onClick={() => handleRecalc(true)} loading={recalc.isPending}>
            Утвердить
          </Button>
        </>
      }
    >
      <div className="crud-table-wrap">
        <table className="gradebook-table">
          <thead>
            <tr>
              <th>Студент</th>
              {data.assignments.map((a) => (
                <th key={a.id} title={a.title}>
                  {a.title}
                  <div style={{ fontWeight: 400, color: 'var(--dc-text-muted)' }}>
                    /{Number(a.maxScore) || 100}
                  </div>
                </th>
              ))}
              <th>Итог</th>
              <th>Буква</th>
              <th>GPA</th>
            </tr>
          </thead>
          <tbody>
            {data.students.map((s) => {
              const final = finalsByStudent.get(s.id);
              return (
                <tr key={s.id}>
                  <td>
                    <strong>{s.name || s.email}</strong>
                    <div className="muted" style={{ fontSize: '0.75rem' }}>{s.email}</div>
                  </td>
                  {data.assignments.map((a) => {
                    const g = indexByStudent.get(`${s.id}:${a.id}`);
                    return (
                      <td key={a.id} style={{ textAlign: 'center' }}>
                        {g?.score ?? <span className="muted">—</span>}
                      </td>
                    );
                  })}
                  <td className={`gradebook-final ${final ? `gradebook-final--${(final.letter || 'F').charAt(0)}` : ''}`}>
                    {final ? `${Number(final.totalScore).toFixed(1)}%` : '—'}
                  </td>
                  <td>{final?.letter || '—'}</td>
                  <td>{final?.gpa != null ? Number(final.gpa).toFixed(2) : '—'}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
