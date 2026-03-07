import { useAuth } from '../context/AuthContext';
import AdminDashboard from './AdminDashboard';
import TeacherDashboard from './TeacherDashboard';
import StudentDashboard from './StudentDashboard';

export default function Dashboard() {
  const { user } = useAuth();
  const role = user?.role || 'student';

  if (role === 'admin') return <AdminDashboard />;
  if (role === 'teacher') return <TeacherDashboard />;
  return <StudentDashboard />;
}
