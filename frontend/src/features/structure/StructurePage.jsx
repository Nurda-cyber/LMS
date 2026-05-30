import { useMemo, useState } from 'react';
import { useStructureList } from './hooks';
import { CrudResource } from './CrudResource';
import { TERM_LABEL, DEGREE_LABEL } from './fieldSchemas';
import './structure.css';

const TABS = [
  { id: 'faculties', label: 'Факультеты' },
  { id: 'departments', label: 'Кафедры' },
  { id: 'specialties', label: 'Специальности' },
  { id: 'academic-years', label: 'Учебные годы' },
  { id: 'semesters', label: 'Семестры' },
  { id: 'groups', label: 'Группы' },
];

/**
 * Админ-страница «Структура университета».
 * Использует один компонент CrudResource для всех ресурсов с разными колонками
 * и общим контекстом (родительские сущности для выпадающих списков).
 */
export default function StructurePage() {
  const [tab, setTab] = useState('faculties');

  const faculties = useStructureList('faculties');
  const departments = useStructureList('departments');
  const specialties = useStructureList('specialties');
  const academicYears = useStructureList('academic-years');

  const context = useMemo(
    () => ({
      faculties: faculties.data || [],
      departments: departments.data || [],
      specialties: specialties.data || [],
      academicYears: academicYears.data || [],
    }),
    [faculties.data, departments.data, specialties.data, academicYears.data]
  );

  return (
    <div className="dashboard-content content-panel structure-page">
      <nav className="structure-tabs" role="tablist" aria-label="Структура университета">
        {TABS.map((t) => (
          <button
            key={t.id}
            role="tab"
            type="button"
            aria-selected={tab === t.id}
            className={`structure-tab ${tab === t.id ? 'is-active' : ''}`}
            onClick={() => setTab(t.id)}
          >
            {t.label}
          </button>
        ))}
      </nav>

      {tab === 'faculties' && (
        <CrudResource
          resource="faculties"
          title="Факультеты"
          subtitle="Высшая единица организационной структуры университета."
          createLabel="Создать факультет"
          emptyTitle="Нет факультетов"
          emptyDesc="Добавьте первый факультет — он станет родителем для кафедр."
          columns={[
            { key: 'name', label: 'Название' },
            { key: 'shortName', label: 'Сокращение' },
            { key: 'description', label: 'Описание' },
          ]}
        />
      )}

      {tab === 'departments' && (
        <CrudResource
          resource="departments"
          title="Кафедры"
          subtitle="Подразделения факультетов, к которым прикреплены специальности."
          createLabel="Создать кафедру"
          context={context}
          emptyTitle="Нет кафедр"
          emptyDesc="Создайте кафедру и привяжите её к факультету."
          columns={[
            { key: 'name', label: 'Название' },
            { key: 'shortName', label: 'Сокращение' },
            {
              key: 'facultyId',
              label: 'Факультет',
              render: (row, ctx) =>
                ctx.faculties.find((f) => f.id === row.facultyId)?.name || '—',
            },
          ]}
        />
      )}

      {tab === 'specialties' && (
        <CrudResource
          resource="specialties"
          title="Специальности"
          subtitle="Образовательные программы с шифром и длительностью обучения."
          createLabel="Создать специальность"
          context={context}
          emptyTitle="Нет специальностей"
          emptyDesc="Создайте специальность для конкретной кафедры."
          columns={[
            { key: 'code', label: 'Шифр' },
            { key: 'name', label: 'Название' },
            {
              key: 'departmentId',
              label: 'Кафедра',
              render: (row, ctx) =>
                ctx.departments.find((d) => d.id === row.departmentId)?.name || '—',
            },
            {
              key: 'degree',
              label: 'Степень',
              render: (row) => DEGREE_LABEL[row.degree] || row.degree,
            },
            { key: 'durationYears', label: 'Лет' },
          ]}
        />
      )}

      {tab === 'academic-years' && (
        <CrudResource
          resource="academic-years"
          title="Учебные годы"
          subtitle="Учебные годы (с сентября по август) и их активный статус."
          createLabel="Создать учебный год"
          emptyTitle="Нет учебных годов"
          emptyDesc="Создайте текущий учебный год и пометьте его активным."
          columns={[
            { key: 'startYear', label: 'Начало', render: (r) => `${r.startYear}/${r.endYear}` },
            {
              key: 'isActive',
              label: 'Статус',
              render: (r) => (r.isActive ? 'Активный' : 'Архив'),
            },
          ]}
        />
      )}

      {tab === 'semesters' && (
        <CrudResource
          resource="semesters"
          title="Семестры"
          subtitle="Семестры в рамках учебного года: осенний, весенний, летний."
          createLabel="Создать семестр"
          context={context}
          emptyTitle="Нет семестров"
          emptyDesc="Создайте семестры — без них не выставить итоговые оценки."
          columns={[
            {
              key: 'academicYearId',
              label: 'Учебный год',
              render: (r, ctx) => {
                const y = ctx.academicYears.find((x) => x.id === r.academicYearId);
                return y ? `${y.startYear}/${y.endYear}` : '—';
              },
            },
            { key: 'term', label: 'Семестр', render: (r) => TERM_LABEL[r.term] || r.term },
            { key: 'startDate', label: 'Дата начала' },
            { key: 'endDate', label: 'Дата окончания' },
            {
              key: 'isActive',
              label: 'Статус',
              render: (r) => (r.isActive ? 'Активный' : 'Архив'),
            },
          ]}
        />
      )}

      {tab === 'groups' && (
        <CrudResource
          resource="groups"
          title="Академические группы"
          subtitle="Группы студентов внутри специальности."
          createLabel="Создать группу"
          context={context}
          emptyTitle="Нет групп"
          emptyDesc="Создайте группы для зачисления студентов."
          columns={[
            { key: 'name', label: 'Шифр' },
            {
              key: 'specialtyId',
              label: 'Специальность',
              render: (r, ctx) =>
                ctx.specialties.find((s) => s.id === r.specialtyId)?.name || '—',
            },
            { key: 'enrollmentYear', label: 'Год поступления' },
            { key: 'language', label: 'Язык' },
          ]}
        />
      )}
    </div>
  );
}
