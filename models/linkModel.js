const { DataTypes } = require('sequelize');
const { db } = require('../db');
const DB_PREFIX = process.env.DB_PREFIX || '';

const Link = db.define(
  'Link',
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    database_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Database',
        key: 'id',
      },
    },
    sourceTable: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    sourceField: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    targetTable: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    targetField: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },
  {
    timestamps: true,
    updatedAt: 'updatedAt',
    createdAt: 'createdAt',
    tableName: DB_PREFIX + 'link',
  }
);

module.exports = Link;
