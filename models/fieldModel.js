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
      allowNull: false,
    },
    lenght: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    default_value: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    primary_field: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    ai: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    index_field: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    order: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    nullable: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    table_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
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
/*
Field.belongsTo(Table, {
  foreignKey: 'table_id',
  as: 'table'
});
*/
module.exports = Field;
