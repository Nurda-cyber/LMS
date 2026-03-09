const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const AssignmentGrade = sequelize.define('AssignmentGrade', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  assignmentId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: { model: 'assignments', key: 'id' },
    onDelete: 'CASCADE'
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: { model: 'users', key: 'id' },
    onDelete: 'CASCADE'
  },
  grade: {
    type: DataTypes.STRING(50),
    allowNull: true,
    comment: 'Оценка: число (1-5, 0-100) или буква (A, B, ...); null — не выставлена'
  },
  comment: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  submissionText: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Текст ответа студента'
  },
  submittedAt: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: 'Дата и время отправки'
  }
}, {
  tableName: 'assignment_grades',
  timestamps: true,
  underscored: true,
  indexes: [
    { unique: true, fields: ['assignment_id', 'user_id'] }
  ]
});

module.exports = AssignmentGrade;
