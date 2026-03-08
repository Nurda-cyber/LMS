const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const PasswordChangeRequest = sequelize.define('PasswordChangeRequest', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: { model: 'users', key: 'id' },
    onDelete: 'CASCADE'
  },
  newPasswordHash: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  status: {
    type: DataTypes.ENUM('pending', 'accepted', 'rejected'),
    allowNull: false,
    defaultValue: 'pending'
  }
}, {
  tableName: 'password_change_requests',
  timestamps: true,
  underscored: true
});

module.exports = PasswordChangeRequest;
