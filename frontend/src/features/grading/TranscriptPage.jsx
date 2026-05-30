import { Card, EmptyState, Spinner, Badge } from '../../shared/ui';
import { useTranscript } from './hooks';
import './grading.css';

const TERM_LABEL = { fall: 'Осенний', spring: 'Весенний', summer: 'Летний' };

/**
 * Страница «Транскрипт» — итоговые оценки студента, сгруппированные по
 * семестрам, плюс общий GPA.
 */
export default function TranscriptPage() {
  const { data, isLoading, isError, error } = useTranscript('me');

  if (isLoading) {
    return (
      <div className="dashboard-content content-panel">
        <Card><Spinner /></Card>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="dashboard-content content-panel">
        <Card>
          <EmptyState title="Ошибка" description={error?.message} />
        </Card>
      </div>
    );
  }

  const semesters = data?.semesters || [];
  const overall = data?.overallGpa;

  return (
    <div className="dashboard-content content-panel">
      <Card>
        <div className="transcript-header">
          <h2 style={{ margin: 0 }}>Транскрипт</h2>
          <div>
            <div className="muted" style={{ fontSize: '0.75rem' }}>Общий GPA</div>
            <div className="transcript-gpa">{overall != null ? overall.toFixed(2) : '—'}</div>
          </div>
        </div>

        {semesters.length === 0 ? (
          <EmptyState
            title="Нет итоговых оценок"
            description="Преподаватель ещё не утвердил итоговые оценки. Вы можете посмотреть текущие оценки на странице «Оценки»."
          />
        ) : (
          semesters.map((s, idx) => (
            <section key={idx} className="transcript-semester">
              <div className="transcript-semester__title">
                <h4>
                  {s.semester
                    ? `${TERM_LABEL[s.semester.term] || s.semester.term} семестр`
                    : 'Без указания семестра'}
                </h4>
                <span className="transcript-semester__gpa">
                  GPA: {s.gpa != null ? s.gpa.toFixed(2) : '—'}
                </span>
              </div>
              <div className="crud-table-wrap">
                <table className="transcript-table">
                  <thead>
                    <tr>
                      <th>Курс</th>
                      <th>Итог</th>
                      <th>Буква</th>
                      <th>GPA</th>
                      <th>Статус</th>
                    </tr>
                  </thead>
                  <tbody>
                    {s.items.map((it) => (
                      <tr key={it.courseId}>
                        <td>{it.courseName}</td>
                        <td>{Number(it.totalScore).toFixed(1)}%</td>
                        <td><strong>{it.letter || '—'}</strong></td>
                        <td>{it.gpa != null ? Number(it.gpa).toFixed(2) : '—'}</td>
                        <td>
                          <Badge variant={it.status === 'finalized' ? 'success' : 'warning'}>
                            {it.status === 'finalized' ? 'Утверждено' : 'Черновик'}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          ))
        )}
      </Card>
    </div>
  );
}
