const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Assignment = sequelize.define('Assignment', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  courseId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: { model: 'courses', key: 'id' },
    onDelete: 'CASCADE'
  },
  title: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  dueAt: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: 'Крайний срок сдачи (дата и время)'
  },
  categoryId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    field: 'category_id',
    references: { model: 'grade_categories', key: 'id' },
    onDelete: 'SET NULL',
    comment: 'Категория оценок (домашние, тесты, экзамен и т.п.)',
  },
  maxScore: {
    type: DataTypes.DECIMAL(6, 2),
    allowNull: false,
    defaultValue: 100,
    field: 'max_score',
    comment: 'Максимальный балл за задание',
  },
}, {
  tableName: 'assignments',
  timestamps: true,
  underscored: true
});

module.exports = Assignment;
