const { DataTypes } = require('sequelize');
const sequelize = require('../../../../config/database');

const Group = sequelize.define('Group', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  specialtyId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'specialty_id',
    references: { model: 'specialties', key: 'id' },
    onDelete: 'CASCADE',
  },
  name: {
    type: DataTypes.STRING(64),
    allowNull: false,
    comment: 'Имя/шифр группы (например, SE-2401)',
  },
  enrollmentYear: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'enrollment_year',
    comment: 'Год поступления',
    validate: { min: 2000, max: 2100 },
  },
  curatorId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    field: 'curator_id',
    references: { model: 'users', key: 'id' },
    onDelete: 'SET NULL',
  },
  language: { type: DataTypes.STRING(8), allowNull: true, defaultValue: 'ru' },
}, {
  tableName: 'groups',
  timestamps: true,
  underscored: true,
  indexes: [{ unique: true, fields: ['specialty_id', 'name'] }],
});

module.exports = Group;
