import { useState } from 'react';
import * as api from '../api/client';

function formatDeadline(iso) {
  if (!iso) return null;
  try {
    return new Date(iso).toLocaleString('ru-RU', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch {
    return iso;
  }
}

export default function AssignmentStudentView({ assignment, courseId, onSubmitted }) {
  const dueAt = assignment?.dueAt ? new Date(assignment.dueAt) : null;
  const now = new Date();
  const isPastDeadline = dueAt && now > dueAt;
  const myGrade = assignment?.grades?.[0];
  const alreadySubmitted = !!myGrade?.submittedAt;
  const mySubmissionText = myGrade?.submissionText ?? '';

  const [submissionText, setSubmissionText] = useState(mySubmissionText || '');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const canSubmit = !alreadySubmitted && !isPastDeadline;

  async function handleSubmit(e) {
    e.preventDefault();
    if (!canSubmit) return;
    setError('');
    setSubmitting(true);
    try {
      await api.submitAssignment(courseId, assignment.id, submissionText);
      onSubmitted?.();
    } catch (err) {
      setError(err.message || 'Ошибка отправки');
    } finally {
      setSubmitting(false);
    }
  }

  if (!assignment) return null;

  const deadlineStr = formatDeadline(assignment.dueAt);

  return (
    <div className="assignment-student-view content-panel-card">
      <h3 className="assignment-student-title">{assignment.title}</h3>
      {assignment.description && (
        <div className="assignment-student-description">{assignment.description}</div>
      )}
      {deadlineStr && (
        <p className="assignment-student-deadline">
          <strong>Крайний срок подачи заявок:</strong> {deadlineStr}
        </p>
      )}

      {alreadySubmitted ? (
        <div className="assignment-student-submitted">
          <p className="assignment-student-submitted-label">Ваш ответ (отправлен):</p>
          <div className="assignment-student-answer-readonly">
            {mySubmissionText || '—'}
          </div>
          {myGrade?.grade != null && myGrade.grade !== '' && (
            <p className="assignment-student-grade">
              Оценка: <strong>{myGrade.grade}</strong>
              {myGrade.comment && ` — ${myGrade.comment}`}
            </p>
          )}
        </div>
      ) : (
        <>
          <p className="assignment-student-answer-label">Ваш ответ:</p>
          <textarea
            className="assignment-student-textarea"
            value={submissionText}
            onChange={(e) => setSubmissionText(e.target.value)}
            placeholder="Введите ваш ответ..."
            rows={12}
            readOnly={!canSubmit}
          />
          {error && <div className="auth-error">{error}</div>}
          {isPastDeadline ? (
            <p className="assignment-deadline-expired">
              Крайний срок истёк. Отправка закрыта.
            </p>
          ) : (
            <button
              type="button"
              className="btn btn-primary assignment-submit-btn"
              onClick={handleSubmit}
              disabled={submitting}
            >
              {submitting ? 'Отправка…' : 'Отправить задание'}
            </button>
          )}
        </>
      )}
    </div>
  );
}
