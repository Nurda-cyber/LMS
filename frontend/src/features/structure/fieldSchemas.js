/**
 * Декларативные описания форм CRUD-сущностей.
 * Используются и при создании, и при редактировании.
 *
 * Тип поля: text | textarea | number | select | boolean.
 * `options` — для select; может быть массивом значений или функцией от контекста.
 */

const DEGREE_OPTIONS = [
  { value: 'bachelor', label: 'Бакалавр' },
  { value: 'master', label: 'Магистр' },
  { value: 'phd', label: 'PhD' },
];

const TERM_OPTIONS = [
  { value: 'fall', label: 'Осенний' },
  { value: 'spring', label: 'Весенний' },
  { value: 'summer', label: 'Летний' },
];

const facultyFields = [
  { name: 'name', label: 'Название факультета', type: 'text', required: true },
  { name: 'shortName', label: 'Сокращение', type: 'text' },
  { name: 'description', label: 'Описание', type: 'textarea' },
];

const departmentFields = (context) => [
  {
    name: 'facultyId',
    label: 'Факультет',
    type: 'select',
    required: true,
    options: (context.faculties || []).map((f) => ({ value: f.id, label: f.name })),
  },
  { name: 'name', label: 'Название кафедры', type: 'text', required: true },
  { name: 'shortName', label: 'Сокращение', type: 'text' },
  { name: 'description', label: 'Описание', type: 'textarea' },
];

const specialtyFields = (context) => [
  {
    name: 'departmentId',
    label: 'Кафедра',
    type: 'select',
    required: true,
    options: (context.departments || []).map((d) => ({ value: d.id, label: d.name })),
  },
  { name: 'code', label: 'Шифр (например, 6B06101)', type: 'text', required: true },
  { name: 'name', label: 'Название специальности', type: 'text', required: true },
  { name: 'degree', label: 'Степень', type: 'select', options: DEGREE_OPTIONS, defaultValue: 'bachelor' },
  { name: 'durationYears', label: 'Длительность (лет)', type: 'number', defaultValue: 4, min: 1, max: 10 },
  { name: 'language', label: 'Язык обучения', type: 'text', defaultValue: 'ru' },
  { name: 'description', label: 'Описание', type: 'textarea' },
];

const academicYearFields = [
  { name: 'startYear', label: 'Год начала', type: 'number', required: true, min: 2000, max: 2100 },
  { name: 'isActive', label: 'Активный учебный год', type: 'boolean' },
];

const semesterFields = (context) => [
  {
    name: 'academicYearId',
    label: 'Учебный год',
    type: 'select',
    required: true,
    options: (context.academicYears || []).map((y) => ({
      value: y.id,
      label: `${y.startYear}/${y.endYear}`,
    })),
  },
  { name: 'term', label: 'Семестр', type: 'select', required: true, options: TERM_OPTIONS },
  { name: 'startDate', label: 'Дата начала', type: 'date' },
  { name: 'endDate', label: 'Дата окончания', type: 'date' },
  { name: 'isActive', label: 'Активный семестр', type: 'boolean' },
];

const groupFields = (context) => [
  {
    name: 'specialtyId',
    label: 'Специальность',
    type: 'select',
    required: true,
    options: (context.specialties || []).map((s) => ({ value: s.id, label: `${s.code} — ${s.name}` })),
  },
  { name: 'name', label: 'Шифр группы (например, SE-2401)', type: 'text', required: true },
  { name: 'enrollmentYear', label: 'Год поступления', type: 'number', required: true, min: 2000, max: 2100 },
  { name: 'language', label: 'Язык обучения', type: 'text', defaultValue: 'ru' },
];

/** Получает поля формы для конкретного ресурса. */
export function getFieldsFor(resource, context = {}) {
  switch (resource) {
    case 'faculties':
      return facultyFields;
    case 'departments':
      return departmentFields(context);
    case 'specialties':
      return specialtyFields(context);
    case 'academic-years':
      return academicYearFields;
    case 'semesters':
      return semesterFields(context);
    case 'groups':
      return groupFields(context);
    default:
      return [];
  }
}

export const TERM_LABEL = Object.freeze({ fall: 'Осенний', spring: 'Весенний', summer: 'Летний' });
export const DEGREE_LABEL = Object.freeze({ bachelor: 'Бакалавр', master: 'Магистр', phd: 'PhD' });
