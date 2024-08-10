const { Sequelize } = require('sequelize');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, 'config.env') });

// Leggi il prefisso delle tabelle dalla variabile d'ambiente
const TABLE_PREFIX = process.env.DB_PREFIX || '';

// Configurazione di Sequelize
const db = new Sequelize(process.env.DB_NAME, process.env.DB_USER, process.env.DB_PASSWORD, {
  host: process.env.DB_HOST,
  dialect: 'mysql',
  logging: false, // Disabilita il log delle query SQL
  define: {
    // Aggiunge il prefisso a tutte le tabelle
    tableName: (tableName) => TABLE_PREFIX + tableName,
  },
});

// Test di connessione
db.authenticate()
  .then(() => console.log('Connessione al database MySQL riuscita'))
  .catch(err => console.error('Errore di connessione al database:', err));

module.exports = { db };
