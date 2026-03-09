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
  }
}, {
  tableName: 'assignments',
  timestamps: true,
  underscored: true
});

module.exports = Assignment;
