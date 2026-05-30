import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { gradingApi } from './api';

const categoriesKey = (courseId) => ['grading', 'categories', courseId];
const gradebookKey = (courseId) => ['grading', 'gradebook', courseId];
const transcriptKey = (studentId) => ['grading', 'transcript', studentId];

export function useCategories(courseId, options = {}) {
  return useQuery({
    queryKey: categoriesKey(courseId),
    queryFn: () => gradingApi.listCategories(courseId),
    enabled: !!courseId,
    ...options,
  });
}

export function useCreateCategory(courseId) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload) => gradingApi.createCategory(courseId, payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: categoriesKey(courseId) }),
  });
}

export function useUpdateCategory(courseId) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }) => gradingApi.updateCategory(id, payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: categoriesKey(courseId) }),
  });
}

export function useDeleteCategory(courseId) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id) => gradingApi.deleteCategory(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: categoriesKey(courseId) }),
  });
}

export function useGradebook(courseId) {
  return useQuery({
    queryKey: gradebookKey(courseId),
    queryFn: () => gradingApi.getGradebook(courseId),
    enabled: !!courseId,
  });
}

export function useRecalculate(courseId) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body) => gradingApi.recalculate(courseId, body),
    onSuccess: () => qc.invalidateQueries({ queryKey: gradebookKey(courseId) }),
  });
}

export function useTranscript(studentId = 'me') {
  return useQuery({
    queryKey: transcriptKey(studentId),
    queryFn: () => gradingApi.getTranscript(studentId),
  });
}
