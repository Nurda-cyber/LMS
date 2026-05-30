const { DataTypes } = require('sequelize');
const sequelize = require('../../../../config/database');

const FinalGrade = sequelize.define('FinalGrade', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  courseId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'course_id',
    references: { model: 'courses', key: 'id' },
    onDelete: 'CASCADE',
  },
  studentId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'student_id',
    references: { model: 'users', key: 'id' },
    onDelete: 'CASCADE',
  },
  semesterId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    field: 'semester_id',
    references: { model: 'semesters', key: 'id' },
    onDelete: 'SET NULL',
  },
  totalScore: {
    type: DataTypes.DECIMAL(6, 2),
    allowNull: false,
    defaultValue: 0,
    field: 'total_score',
    comment: 'Итоговый процент 0-100',
  },
  letter: {
    type: DataTypes.STRING(8),
    allowNull: true,
    comment: 'Буквенная оценка ECTS',
  },
  gpa: {
    type: DataTypes.DECIMAL(4, 2),
    allowNull: true,
    comment: 'Оценка по 4-балльной системе GPA',
  },
  status: {
    type: DataTypes.ENUM('draft', 'finalized'),
    allowNull: false,
    defaultValue: 'draft',
  },
}, {
  tableName: 'final_grades',
  timestamps: true,
  underscored: true,
  indexes: [
    { unique: true, fields: ['course_id', 'student_id', 'semester_id'] },
  ],
});

module.exports = FinalGrade;
