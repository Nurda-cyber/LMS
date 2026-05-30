const { DataTypes } = require('sequelize');
const sequelize = require('../../../../config/database');

const Specialty = sequelize.define('Specialty', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  departmentId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'department_id',
    references: { model: 'departments', key: 'id' },
    onDelete: 'CASCADE',
  },
  code: {
    type: DataTypes.STRING(32),
    allowNull: false,
    comment: 'Шифр специальности (например, 6B06101)',
  },
  name: { type: DataTypes.STRING(255), allowNull: false },
  degree: {
    type: DataTypes.ENUM('bachelor', 'master', 'phd'),
    allowNull: false,
    defaultValue: 'bachelor',
  },
  durationYears: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 4,
    field: 'duration_years',
    validate: { min: 1, max: 10 },
  },
  language: { type: DataTypes.STRING(8), allowNull: true, defaultValue: 'ru' },
  description: { type: DataTypes.TEXT, allowNull: true },
}, {
  tableName: 'specialties',
  timestamps: true,
  underscored: true,
  indexes: [{ unique: true, fields: ['code'] }],
});

module.exports = Specialty;
