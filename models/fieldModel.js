const { DataTypes } = require('sequelize');
const { db } = require('../db');
const DB_PREFIX = process.env.DB_PREFIX || '';

const Field = db.define(
  'Field',
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
    field_type: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    lenght: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    default_value: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    primary_field: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    ai: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    index_field: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    order: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    nullable: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    table_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'Table',
        key: 'id',
      },
    },
  },
  {
    timestamps: true,
    updatedAt: 'updatedAt',
    createdAt: 'createdAt',
    tableName: DB_PREFIX + 'field',
  }
);

module.exports = Field;
