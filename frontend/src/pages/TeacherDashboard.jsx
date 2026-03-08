import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import * as api from '../api/client';
import { CourseCard } from './AdminDashboard';

export default function TeacherDashboard() {
  const { user } = useAuth();
  const [teachingCourses, setTeachingCourses] = useState([]);
  const [courseAssignments, setCourseAssignments] = useState({});
  const [loading, setLoading] = useState(true);

  async function loadTeachingCourses() {
    const myCourses = await api.getMyCourses();
    const teaching = (myCourses || []).filter((c) => c.myRole === 'teacher');
    if (teaching.length === 0) {
      setTeachingCourses([]);
      setCourseAssignments({});
      setLoading(false);
      return;
    }
    const fullCourses = await Promise.all(teaching.map((c) => api.getCourse(c.id)));
    const validCourses = fullCourses.filter(Boolean);
    setTeachingCourses(validCourses);
    const assignArrays = await Promise.all(validCourses.map((c) => api.getCourseAssignments(c.id)));
    const assignMap = {};
    validCourses.forEach((c, i) => {
      assignMap[c.id] = assignArrays[i] || [];
    });
    setCourseAssignments(assignMap);
    setLoading(false);
  }

  useEffect(() => {
    loadTeachingCourses();
  }, []);

  if (loading) {
    return (
      <div className="dashboard-content">
        <div className="welcome-card">
          <p className="muted">Загрузка курсов…</p>
        </div>
      </div>
    );
  }

  if (teachingCourses.length === 0) {
    return (
      <div className="dashboard-content">
        <div className="welcome-card">
          <h2>Мои курсы</h2>
          <p className="role-desc">Создавайте задания и выставляйте оценки студентам.</p>
          {user?.name && <p>Имя: {user.name}</p>}
          <p className="muted">Вас пока не назначили ни на один курс. Обратитесь к администратору.</p>
          <Link to="/">На главную</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-content">
      <div className="welcome-card">
        <h2>Мои курсы</h2>
        <p className="role-desc">Создавайте задания и выставляйте оценки студентам. Администратор и студент только просматривают.</p>
      </div>
      <section className="welcome-card courses-section">
        <h2>Курсы</h2>
        <div className="course-cards">
          {teachingCourses.map((course) => (
            <CourseCard
              key={course.id}
              course={course}
              teachers={[]}
              students={[]}
              assignments={courseAssignments[course.id] || []}
              onRefresh={loadTeachingCourses}
              canManageAssignments={true}
              showMembersManagement={false}
              showCourseEdit={false}
            />
          ))}
        </div>
        <p><Link to="/">На главную</Link></p>
      </section>
    </div>
  );
}
