const { DataTypes } = require('sequelize');
const sequelize = require('../../../../config/database');

const Semester = sequelize.define('Semester', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  academicYearId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'academic_year_id',
    references: { model: 'academic_years', key: 'id' },
    onDelete: 'CASCADE',
  },
  term: {
    type: DataTypes.ENUM('fall', 'spring', 'summer'),
    allowNull: false,
  },
  startDate: { type: DataTypes.DATEONLY, allowNull: true, field: 'start_date' },
  endDate: { type: DataTypes.DATEONLY, allowNull: true, field: 'end_date' },
  isActive: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false,
    field: 'is_active',
  },
}, {
  tableName: 'semesters',
  timestamps: true,
  underscored: true,
  indexes: [{ unique: true, fields: ['academic_year_id', 'term'] }],
});

module.exports = Semester;
