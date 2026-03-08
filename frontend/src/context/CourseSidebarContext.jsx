import { createContext, useContext, useState, useCallback } from 'react';
import { useAuth } from './AuthContext';
import * as api from '../api/client';

const CourseSidebarContext = createContext(null);

export function CourseSidebarProvider({ children }) {
  const { user } = useAuth();
  const role = user?.role || 'student';

  const [coursesExpanded, setCoursesExpanded] = useState(false);
  const [selectedCourseId, setSelectedCourseId] = useState(null);
  const [createCourseMode, setCreateCourseMode] = useState(false);
  const [courses, setCourses] = useState([]);
  const [coursesLoading, setCoursesLoading] = useState(false);

  const loadCourses = useCallback(async () => {
    setCoursesLoading(true);
    try {
      const list = role === 'admin' ? await api.getCourses() : await api.getMyCourses();
      setCourses(Array.isArray(list) ? list : []);
    } catch {
      setCourses([]);
    } finally {
      setCoursesLoading(false);
    }
  }, [role]);

  const refreshCourses = useCallback(() => {
    loadCourses();
  }, [loadCourses]);

  const openCreateCourse = useCallback(() => {
    setCreateCourseMode(true);
    setSelectedCourseId(null);
  }, []);

  const selectCourse = useCallback((id) => {
    setSelectedCourseId(id);
    setCreateCourseMode(false);
  }, []);

  const closeCreateCourse = useCallback(() => {
    setCreateCourseMode(false);
  }, []);

  const value = {
    coursesExpanded,
    setCoursesExpanded,
    selectedCourseId,
    setSelectedCourseId: selectCourse,
    createCourseMode,
    setCreateCourseMode,
    openCreateCourse,
    closeCreateCourse,
    courses,
    coursesLoading,
    refreshCourses,
    loadCourses,
    canCreateCourse: role === 'admin',
  };

  return (
    <CourseSidebarContext.Provider value={value}>
      {children}
    </CourseSidebarContext.Provider>
  );
}

export function useCourseSidebar() {
  const ctx = useContext(CourseSidebarContext);
  if (!ctx) throw new Error('useCourseSidebar must be used within CourseSidebarProvider');
  return ctx;
}
