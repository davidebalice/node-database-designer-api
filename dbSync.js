const { db } = require('./db');

db.sync({ force: true }) 
  .then(() => console.log('Database sincronizzato'))
  .catch(err => console.error('Errore nella sincronizzazione del database:', err));
