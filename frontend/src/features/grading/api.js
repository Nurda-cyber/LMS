import { http } from '../../shared/api/httpClient';

/**
 * REST-API подсистемы оценивания.
 */
export const gradingApi = {
  listCategories: (courseId) => http.get(`/grading/courses/${courseId}/grade-categories`),
  createCategory: (courseId, payload) =>
    http.post(`/grading/courses/${courseId}/grade-categories`, payload),
  updateCategory: (id, payload) => http.put(`/grading/grade-categories/${id}`, payload),
  deleteCategory: (id) => http.delete(`/grading/grade-categories/${id}`),

  getGradebook: (courseId) => http.get(`/grading/courses/${courseId}/gradebook`),
  recalculate: (courseId, body = {}) =>
    http.post(`/grading/courses/${courseId}/final-grades/recalculate`, body),

  getTranscript: (studentId = 'me') => http.get(`/grading/students/${studentId}/transcript`),
};
