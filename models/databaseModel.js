const { DataTypes } = require('sequelize');
const { db } = require('../db');
const DB_PREFIX = process.env.DB_PREFIX || '';

const Database = db.define(
  'Database',
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'User',
        key: 'id',
      },
    },
  },
  {
    timestamps: true,
    updatedAt: 'updatedAt',
    createdAt: 'createdAt',
    tableName: DB_PREFIX + 'database',
  }
);

module.exports = Database;
