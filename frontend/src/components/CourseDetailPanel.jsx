import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useCourseSidebar } from '../context/CourseSidebarContext';
import * as api from '../api/client';
import { CourseCard } from '../pages/AdminDashboard';
import StudentCourseView from './StudentCourseView';

export default function CourseDetailPanel({ courseId }) {
  const { user } = useAuth();
  const { refreshCourses } = useCourseSidebar();
  const role = user?.role || 'student';

  const [course, setCourse] = useState(null);
  const [assignments, setAssignments] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!courseId) return;
    let cancelled = false;
    setLoading(true);
    setError('');
    Promise.all([
      api.getCourse(courseId),
      api.getCourseAssignments(courseId),
      role === 'admin' ? Promise.all([api.getTeachers(), api.getStudents()]) : Promise.resolve([[], []])
    ])
      .then(([courseData, assignList, roleData]) => {
        if (cancelled) return;
        setCourse(courseData || null);
        setAssignments(Array.isArray(assignList) ? assignList : []);
        if (role === 'admin') {
          setTeachers(roleData[0] || []);
          setStudents(roleData[1] || []);
        }
      })
      .catch((err) => {
        if (!cancelled) setError(err.message || 'Ошибка загрузки курса');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, [courseId, role]);

  if (!courseId) return null;
  if (loading) {
    return (
      <div className="dashboard-content content-panel">
        <div className="welcome-card content-panel-card">
          <p className="muted">Загрузка курса…</p>
        </div>
      </div>
    );
  }
  if (error || !course) {
    return (
      <div className="dashboard-content content-panel">
        <div className="welcome-card content-panel-card">
          <p className="auth-error">{error || 'Курс не найден'}</p>
        </div>
      </div>
    );
  }

  const canManageAssignments = role === 'admin' || role === 'teacher';
  const showMembersManagement = role === 'admin';
  const showCourseEdit = role === 'admin';
  const isStudent = role === 'student';

  const refreshCourseAndAssignments = () => {
    refreshCourses();
    api.getCourse(courseId).then(setCourse);
    api.getCourseAssignments(courseId).then(setAssignments);
  };

  return (
    <div className="dashboard-content content-panel course-detail-panel">
      <div className="content-panel-card">
        {isStudent ? (
          <StudentCourseView
            course={course}
            assignments={assignments}
            onRefresh={refreshCourseAndAssignments}
          />
        ) : (
          <CourseCard
            course={course}
            teachers={teachers}
            students={students}
            assignments={assignments}
            onRefresh={refreshCourseAndAssignments}
            canManageAssignments={canManageAssignments}
            showMembersManagement={showMembersManagement}
            showCourseEdit={showCourseEdit}
          />
        )}
      </div>
    </div>
  );
}
