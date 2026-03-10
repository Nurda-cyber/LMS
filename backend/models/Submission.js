const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Submission = sequelize.define('Submission', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  assignmentId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: { model: 'assignments', key: 'id' },
    onDelete: 'CASCADE',
    field: 'assignment_id'
  },
  studentId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: { model: 'users', key: 'id' },
    onDelete: 'CASCADE',
    field: 'student_id'
  },
  fileUrl: {
    type: DataTypes.STRING(500),
    allowNull: false,
    field: 'file_url'
  },
  submittedAt: {
    type: DataTypes.DATE,
    allowNull: false,
    field: 'submitted_at'
  },
  grade: {
    type: DataTypes.STRING(50),
    allowNull: true
  },
  feedback: {
    type: DataTypes.TEXT,
    allowNull: true
  }
}, {
  tableName: 'submissions',
  timestamps: true,
  underscored: true
});

module.exports = Submission;

