const { DataTypes } = require('sequelize');
const sequelize = require('../../../../config/database');

const GradeCategory = sequelize.define('GradeCategory', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  courseId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'course_id',
    references: { model: 'courses', key: 'id' },
    onDelete: 'CASCADE',
  },
  name: { type: DataTypes.STRING(128), allowNull: false },
  weight: {
    type: DataTypes.DECIMAL(5, 2),
    allowNull: false,
    defaultValue: 0,
    validate: { min: 0, max: 100 },
    comment: 'Вес категории в итоговой оценке, проценты',
  },
  position: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
  description: { type: DataTypes.TEXT, allowNull: true },
}, {
  tableName: 'grade_categories',
  timestamps: true,
  underscored: true,
});

module.exports = GradeCategory;
