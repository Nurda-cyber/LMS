const { DataTypes } = require('sequelize');
const sequelize = require('../../../../config/database');

const AcademicYear = sequelize.define('AcademicYear', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  startYear: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'start_year',
    validate: { min: 2000, max: 2100 },
  },
  endYear: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'end_year',
    validate: { min: 2001, max: 2101 },
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false,
    field: 'is_active',
  },
}, {
  tableName: 'academic_years',
  timestamps: true,
  underscored: true,
  indexes: [{ unique: true, fields: ['start_year', 'end_year'] }],
});

module.exports = AcademicYear;
