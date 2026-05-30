/**
 * Композиция Sequelize-моделей нового слоя infrastructure/db.
 * Ассоциации между моделями и со старыми (User) описаны здесь.
 */
const User = require('../../../../models/User');
const Course = require('../../../../models/Course');
const Assignment = require('../../../../models/Assignment');

const Faculty = require('./Faculty');
const Department = require('./Department');
const Specialty = require('./Specialty');
const AcademicYear = require('./AcademicYear');
const Semester = require('./Semester');
const Group = require('./Group');
const GradeCategory = require('./GradeCategory');
const FinalGrade = require('./FinalGrade');

Faculty.hasMany(Department, { foreignKey: 'facultyId', as: 'departments' });
Department.belongsTo(Faculty, { foreignKey: 'facultyId', as: 'faculty' });

Department.hasMany(Specialty, { foreignKey: 'departmentId', as: 'specialties' });
Specialty.belongsTo(Department, { foreignKey: 'departmentId', as: 'department' });

Department.belongsTo(User, { foreignKey: 'headOfDepartmentId', as: 'head' });

AcademicYear.hasMany(Semester, { foreignKey: 'academicYearId', as: 'semesters' });
Semester.belongsTo(AcademicYear, { foreignKey: 'academicYearId', as: 'academicYear' });

Specialty.hasMany(Group, { foreignKey: 'specialtyId', as: 'groups' });
Group.belongsTo(Specialty, { foreignKey: 'specialtyId', as: 'specialty' });

Group.belongsTo(User, { foreignKey: 'curatorId', as: 'curator' });

Course.hasMany(GradeCategory, { foreignKey: 'courseId', as: 'gradeCategories' });
GradeCategory.belongsTo(Course, { foreignKey: 'courseId', as: 'course' });

GradeCategory.hasMany(Assignment, { foreignKey: 'categoryId', as: 'assignments' });
Assignment.belongsTo(GradeCategory, { foreignKey: 'categoryId', as: 'gradeCategory' });

Course.hasMany(FinalGrade, { foreignKey: 'courseId', as: 'finalGrades' });
FinalGrade.belongsTo(Course, { foreignKey: 'courseId', as: 'course' });
User.hasMany(FinalGrade, { foreignKey: 'studentId', as: 'finalGrades' });
FinalGrade.belongsTo(User, { foreignKey: 'studentId', as: 'student' });
FinalGrade.belongsTo(Semester, { foreignKey: 'semesterId', as: 'semester' });

const models = {
  Faculty, Department, Specialty, AcademicYear, Semester, Group,
  GradeCategory, FinalGrade,
};

async function syncStructureModels() {
  await Faculty.sync({ alter: true });
  await Department.sync({ alter: true });
  await Specialty.sync({ alter: true });
  await AcademicYear.sync({ alter: true });
  await Semester.sync({ alter: true });
  await Group.sync({ alter: true });
  await GradeCategory.sync({ alter: true });
  await FinalGrade.sync({ alter: true });
}

module.exports = { ...models, syncStructureModels };
