const { DataTypes } = require('sequelize');
const sequelize = require('../../../../config/database');

const Department = sequelize.define('Department', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  facultyId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'faculty_id',
    references: { model: 'faculties', key: 'id' },
    onDelete: 'CASCADE',
  },
  name: { type: DataTypes.STRING(255), allowNull: false },
  shortName: { type: DataTypes.STRING(32), allowNull: true, field: 'short_name' },
  headOfDepartmentId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    field: 'head_of_department_id',
    references: { model: 'users', key: 'id' },
    onDelete: 'SET NULL',
  },
  description: { type: DataTypes.TEXT, allowNull: true },
}, {
  tableName: 'departments',
  timestamps: true,
  underscored: true,
  indexes: [{ unique: true, fields: ['faculty_id', 'name'] }],
});

module.exports = Department;
