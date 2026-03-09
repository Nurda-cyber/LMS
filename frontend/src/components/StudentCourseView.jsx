import { useState, useEffect } from 'react';
import AssignmentStudentView from './AssignmentStudentView';

function formatDeadline(iso) {
  if (!iso) return '';
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

export default function StudentCourseView({ course, assignments, onRefresh }) {
  const [selectedId, setSelectedId] = useState(null);
  const selected = assignments.find((a) => a.id === selectedId) || assignments[0] || null;

  useEffect(() => {
    if (assignments.length > 0 && (!selectedId || !assignments.some((a) => a.id === selectedId))) {
      setSelectedId(assignments[0].id);
    }
  }, [assignments, selectedId]);

  return (
    <div className="student-course-view">
      <div className="course-card">
        <div className="course-card-title">
          <h3>{course.name}</h3>
        </div>
        {course.description && <p className="course-desc">{course.description}</p>}
      </div>

      <div className="student-assignments-section">
        <h4>Задания</h4>
        {assignments.length === 0 ? (
          <p className="muted">Нет заданий.</p>
        ) : (
          <>
            <ul className="student-assignments-list">
              {assignments.map((a) => {
                const submitted = !!a.grades?.[0]?.submittedAt;
                const grade = a.grades?.[0]?.grade;
                return (
                  <li key={a.id}>
                    <button
                      type="button"
                      className={`student-assignment-link ${selectedId === a.id ? 'selected' : ''}`}
                      onClick={() => setSelectedId(a.id)}
                    >
                      <span className="student-assignment-link-title">{a.title}</span>
                      {a.dueAt && (
                        <span className="student-assignment-link-due">
                          Срок: {formatDeadline(a.dueAt)}
                        </span>
                      )}
                      {submitted ? (
                        <span className="student-assignment-link-status submitted">
                          Отправлено
                          {grade != null && grade !== '' && ` · ${grade}`}
                        </span>
                      ) : (
                        <span className="student-assignment-link-status">Не отправлено</span>
                      )}
                    </button>
                  </li>
                );
              })}
            </ul>
            {selected && (
              <AssignmentStudentView
                key={selected.id}
                assignment={selected}
                courseId={course.id}
                onSubmitted={onRefresh}
              />
            )}
          </>
        )}
      </div>
    </div>
  );
}
