import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import { CourseSidebarProvider } from './context/CourseSidebarContext';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import Register from './pages/Register';
import DashboardLayout from './components/DashboardLayout';
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import AssignmentsPage from './pages/AssignmentsPage';
import GradesPage from './pages/GradesPage';
import StructurePage from './features/structure/StructurePage';
import GradebookPage from './features/grading/GradebookPage';
import TranscriptPage from './features/grading/TranscriptPage';

export default function App() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="loading-screen">
        <p>Загрузка…</p>
      </div>
    );
  }

  return (
    <Routes>
      <Route path="/" element={user ? <Navigate to="/dashboard" replace /> : <Navigate to="/login" replace />} />
      <Route path="/login" element={user ? <Navigate to="/dashboard" replace /> : <Login />} />
      <Route path="/register" element={user ? <Navigate to="/dashboard" replace /> : <Register />} />
      <Route path="/dashboard" element={<ProtectedRoute><CourseSidebarProvider><DashboardLayout /></CourseSidebarProvider></ProtectedRoute>}>
        <Route index element={<Dashboard />} />
        <Route path="assignments" element={<AssignmentsPage />} />
        <Route path="grades" element={<GradesPage />} />
        <Route path="structure" element={<StructurePage />} />
        <Route path="gradebook" element={<GradebookPage />} />
        <Route path="transcript" element={<TranscriptPage />} />
        <Route path="profile" element={<Profile />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
