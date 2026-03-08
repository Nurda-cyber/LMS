import { useAuth } from '../context/AuthContext';
import { useCourseSidebar } from '../context/CourseSidebarContext';
import CourseDetailPanel from '../components/CourseDetailPanel';
import CreateCourseForm from '../components/CreateCourseForm';

export default function Dashboard() {
  const { user } = useAuth();
  const { selectedCourseId, createCourseMode } = useCourseSidebar();
  const role = user?.role || 'student';

  if (createCourseMode) {
    return <CreateCourseForm />;
  }
  if (selectedCourseId) {
    return <CourseDetailPanel courseId={selectedCourseId} />;
  }

  const roleLabels = { admin: 'Администратор', teacher: 'Преподаватель', student: 'Студент' };
  return (
    <div className="dashboard-content content-panel">
      <div className="welcome-card content-panel-card content-welcome">
        <h2>Добро пожаловать{user?.name ? `, ${user.name}` : ''}</h2>
        <p className="role-desc">Роль: {roleLabels[role]}.</p>
        <p className="muted">Нажмите «Курсы» на боковой панели, чтобы открыть список курсов. Выберите курс для просмотра описания, студентов, оценок и заданий.</p>
      </div>
    </div>
  );
}
