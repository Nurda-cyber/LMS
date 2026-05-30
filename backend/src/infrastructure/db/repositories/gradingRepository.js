const SequelizeGradingRepository = require('./SequelizeGradingRepository');
const legacy = require('../../../../models');
const structure = require('../models');

const models = {
  Course: legacy.Course,
  CourseUser: legacy.CourseUser,
  User: legacy.User,
  Assignment: legacy.Assignment,
  AssignmentGrade: legacy.AssignmentGrade,
  GradeCategory: structure.GradeCategory,
  FinalGrade: structure.FinalGrade,
  Semester: structure.Semester,
};

module.exports = new SequelizeGradingRepository({ models });
