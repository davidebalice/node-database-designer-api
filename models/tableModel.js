const { DataTypes } = require('sequelize');
const { db } = require('../db');
const DB_PREFIX = process.env.DB_PREFIX || '';
const Field = require('../models/fieldModel');

const Table = db.define(
  'Table',
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
    x: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    y: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    database_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Database',
        key: 'id',
      },
    },
  },
  {
    timestamps: true,
    updatedAt: 'updatedAt',
    createdAt: 'createdAt',
    tableName: DB_PREFIX + 'table',
  }
);

Table.hasMany(Field, { foreignKey: 'table_id', as: 'fields' });
Field.belongsTo(Table, { foreignKey: 'table_id', as: 'table' });

module.exports = Table;
