const { Sequelize } = require('sequelize');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, 'config.env') });

const TABLE_PREFIX = process.env.DB_PREFIX || '';

const db = new Sequelize(process.env.DB_NAME, process.env.DB_USER, process.env.DB_PASSWORD, {
  host: process.env.DB_HOST,
  dialect: 'mysql',
  logging: false,
  define: {
    tableName: (tableName) => TABLE_PREFIX + tableName,
  },
});

db.authenticate()
  .then(() => console.log('Database MySQL connected!'))
  .catch((err) => console.error('Database connection error:', err));

module.exports = { db };
