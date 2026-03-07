const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const CourseUser = sequelize.define('CourseUser', {
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
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: { model: 'users', key: 'id' },
    onDelete: 'CASCADE'
  },
  role: {
    type: DataTypes.ENUM('teacher', 'student'),
    allowNull: false
  }
}, {
  tableName: 'course_users',
  timestamps: true,
  underscored: true,
  indexes: [
    { unique: true, fields: ['course_id', 'user_id'] }
  ]
});

module.exports = CourseUser;
