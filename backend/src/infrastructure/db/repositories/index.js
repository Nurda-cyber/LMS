const SequelizeStructureRepository = require('./SequelizeStructureRepository');
const models = require('../models');

const Faculty = require('../../../domain/entities/Faculty');
const Department = require('../../../domain/entities/Department');
const Specialty = require('../../../domain/entities/Specialty');
const AcademicYear = require('../../../domain/entities/AcademicYear');
const Semester = require('../../../domain/entities/Semester');
const Group = require('../../../domain/entities/Group');

const facultyRepository = new SequelizeStructureRepository({
  model: models.Faculty,
  toDomain: (row) => new Faculty(row),
  label: 'Факультет',
});

const departmentRepository = new SequelizeStructureRepository({
  model: models.Department,
  toDomain: (row) => new Department(row),
  label: 'Кафедра',
});

const specialtyRepository = new SequelizeStructureRepository({
  model: models.Specialty,
  toDomain: (row) => new Specialty(row),
  label: 'Специальность',
});

const academicYearRepository = new SequelizeStructureRepository({
  model: models.AcademicYear,
  toDomain: (row) => new AcademicYear(row),
  label: 'Учебный год',
});

const semesterRepository = new SequelizeStructureRepository({
  model: models.Semester,
  toDomain: (row) => new Semester(row),
  label: 'Семестр',
});

const groupRepository = new SequelizeStructureRepository({
  model: models.Group,
  toDomain: (row) => new Group(row),
  label: 'Группа',
});

module.exports = {
  facultyRepository,
  departmentRepository,
  specialtyRepository,
  academicYearRepository,
  semesterRepository,
  groupRepository,
};
