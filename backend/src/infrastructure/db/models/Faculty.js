const { DataTypes } = require('sequelize');
const sequelize = require('../../../../config/database');

const Faculty = sequelize.define('Faculty', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  name: { type: DataTypes.STRING(255), allowNull: false },
  shortName: { type: DataTypes.STRING(32), allowNull: true, field: 'short_name' },
  description: { type: DataTypes.TEXT, allowNull: true },
}, {
  tableName: 'faculties',
  timestamps: true,
  underscored: true,
  indexes: [{ unique: true, fields: ['name'] }],
});

module.exports = Faculty;
