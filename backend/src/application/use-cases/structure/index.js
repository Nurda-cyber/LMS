const createStructureUseCases = require('./StructureUseCases');

const Faculty = require('../../../domain/entities/Faculty');
const Department = require('../../../domain/entities/Department');
const Specialty = require('../../../domain/entities/Specialty');
const AcademicYear = require('../../../domain/entities/AcademicYear');
const Semester = require('../../../domain/entities/Semester');
const Group = require('../../../domain/entities/Group');

const {
  facultyRepository,
  departmentRepository,
  specialtyRepository,
  academicYearRepository,
  semesterRepository,
  groupRepository,
} = require('../../../infrastructure/db/repositories');

const facultyUseCases = createStructureUseCases({
  repository: facultyRepository, Entity: Faculty, label: 'Факультет',
});

const departmentUseCases = createStructureUseCases({
  repository: departmentRepository, Entity: Department, label: 'Кафедра',
});

const specialtyUseCases = createStructureUseCases({
  repository: specialtyRepository, Entity: Specialty, label: 'Специальность',
});

const academicYearUseCases = createStructureUseCases({
  repository: academicYearRepository, Entity: AcademicYear, label: 'Учебный год',
});

const semesterUseCases = createStructureUseCases({
  repository: semesterRepository, Entity: Semester, label: 'Семестр',
});

const groupUseCases = createStructureUseCases({
  repository: groupRepository, Entity: Group, label: 'Группа',
});

module.exports = {
  facultyUseCases,
  departmentUseCases,
  specialtyUseCases,
  academicYearUseCases,
  semesterUseCases,
  groupUseCases,
};
