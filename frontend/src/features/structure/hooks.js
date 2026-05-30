import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { structureApi } from './api';

/**
 * Запросы и мутации по ресурсам структуры — единая обвязка над TanStack Query.
 */
function listKey(resource) {
  return ['structure', resource, 'list'];
}

export function useStructureList(resource, options = {}) {
  return useQuery({
    queryKey: listKey(resource),
    queryFn: () => structureApi.list(resource),
    ...options,
  });
}

export function useCreateStructure(resource) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload) => structureApi.create(resource, payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: listKey(resource) }),
  });
}

export function useUpdateStructure(resource) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }) => structureApi.update(resource, id, payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: listKey(resource) }),
  });
}

export function useDeleteStructure(resource) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id) => structureApi.remove(resource, id),
    onSuccess: () => qc.invalidateQueries({ queryKey: listKey(resource) }),
  });
}
