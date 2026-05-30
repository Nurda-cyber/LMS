import { http } from '../../shared/api/httpClient';

/**
 * REST-API структуры университета.
 * Точечные функции — каждая делает один HTTP-запрос.
 */
export const structureApi = {
  list: (resource) => http.get(`/structure/${resource}`),
  get: (resource, id) => http.get(`/structure/${resource}/${id}`),
  create: (resource, payload) => http.post(`/structure/${resource}`, payload),
  update: (resource, id, payload) => http.put(`/structure/${resource}/${id}`, payload),
  remove: (resource, id) => http.delete(`/structure/${resource}/${id}`),
};

export const STRUCTURE_RESOURCES = Object.freeze({
  faculties: 'faculties',
  departments: 'departments',
  specialties: 'specialties',
  academicYears: 'academic-years',
  semesters: 'semesters',
  groups: 'groups',
});
