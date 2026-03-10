const sequelize = require('../config/database');
const User = require('./User');
const Course = require('./Course');
const CourseUser = require('./CourseUser');
const PasswordChangeRequest = require('./PasswordChangeRequest');
const Notification = require('./Notification');
const Assignment = require('./Assignment');
const AssignmentGrade = require('./AssignmentGrade');
const Submission = require('./Submission');

User.belongsToMany(Course, { through: CourseUser, foreignKey: 'userId', as: 'courses' });
Course.belongsToMany(User, { through: CourseUser, foreignKey: 'courseId', as: 'users' });
CourseUser.belongsTo(User, { foreignKey: 'userId' });
CourseUser.belongsTo(Course, { foreignKey: 'courseId' });

Course.hasMany(Assignment, { foreignKey: 'courseId' });
Assignment.belongsTo(Course, { foreignKey: 'courseId' });
Assignment.hasMany(AssignmentGrade, { foreignKey: 'assignmentId' });
AssignmentGrade.belongsTo(Assignment, { foreignKey: 'assignmentId' });
AssignmentGrade.belongsTo(User, { foreignKey: 'userId' });
User.hasMany(AssignmentGrade, { foreignKey: 'userId' });

User.hasMany(PasswordChangeRequest, { foreignKey: 'userId' });
PasswordChangeRequest.belongsTo(User, { foreignKey: 'userId' });
User.hasMany(Notification, { foreignKey: 'userId' });
Notification.belongsTo(User, { foreignKey: 'userId' });

Assignment.hasMany(Notification, { foreignKey: 'assignmentId' });
Notification.belongsTo(Assignment, { foreignKey: 'assignmentId' });

Assignment.hasMany(Submission, { foreignKey: 'assignmentId', as: 'Submissions' });
Submission.belongsTo(Assignment, { foreignKey: 'assignmentId' });
User.hasMany(Submission, { foreignKey: 'studentId', as: 'Submissions' });
Submission.belongsTo(User, { foreignKey: 'studentId', as: 'Student' });

const db = { sequelize, User, Course, CourseUser, PasswordChangeRequest, Notification, Assignment, AssignmentGrade, Submission };

module.exports = db;
