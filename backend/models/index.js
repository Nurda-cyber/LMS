const sequelize = require('../config/database');
const User = require('./User');
const Course = require('./Course');
const CourseUser = require('./CourseUser');

User.belongsToMany(Course, { through: CourseUser, foreignKey: 'userId', as: 'courses' });
Course.belongsToMany(User, { through: CourseUser, foreignKey: 'courseId', as: 'users' });
CourseUser.belongsTo(User, { foreignKey: 'userId' });
CourseUser.belongsTo(Course, { foreignKey: 'courseId' });

const db = { sequelize, User, Course, CourseUser };

module.exports = db;
