import { useState, useRef } from 'react';
import * as api from '../api/client';

const MAX_FILE_MB = 10;
const ACCEPT_FILES = '.pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document';

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
  const [selectedFile, setSelectedFile] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef(null);

  const canSubmit = !alreadySubmitted && !isPastDeadline;

  function handleFileChange(e) {
    const file = e.target.files?.[0];
    setError('');
    if (!file) {
      setSelectedFile(null);
      return;
    }
    const sizeMB = file.size / (1024 * 1024);
    if (sizeMB > MAX_FILE_MB) {
      setError(`Файл слишком большой. Максимум ${MAX_FILE_MB} МБ.`);
      setSelectedFile(null);
      e.target.value = '';
      return;
    }
    const ext = (file.name || '').toLowerCase().split('.').pop();
    const ok = file.type === 'application/pdf' ||
      file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
      ext === 'pdf' || ext === 'docx';
    if (!ok) {
      setError('Допустимы только файлы PDF и DOCX.');
      setSelectedFile(null);
      e.target.value = '';
      return;
    }
    setSelectedFile(file);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!canSubmit) return;
    setError('');
    setSubmitting(true);
    try {
      if (selectedFile) {
        await api.submitAssignmentFile(assignment.id, selectedFile);
      } else {
        await api.submitAssignment(courseId, assignment.id, submissionText);
      }
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
          <p className="assignment-student-answer-label">Ваш ответ (текст):</p>
          <textarea
            className="assignment-student-textarea"
            value={submissionText}
            onChange={(e) => setSubmissionText(e.target.value)}
            placeholder="Введите ваш ответ..."
            rows={6}
            readOnly={!canSubmit}
          />

          <div className="assignment-student-file-upload">
            <p className="assignment-student-answer-label">Или загрузите файл (PDF, DOCX, до {MAX_FILE_MB} МБ):</p>
            <input
              ref={fileInputRef}
              type="file"
              accept={ACCEPT_FILES}
              onChange={handleFileChange}
              disabled={!canSubmit}
              className="assignment-student-file-input"
            />
            {selectedFile && (
              <p className="assignment-student-file-name">
                Выбран файл: <strong>{selectedFile.name}</strong> ({(selectedFile.size / 1024).toFixed(1)} КБ)
              </p>
            )}
          </div>

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
