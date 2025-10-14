const { Pool } = require('pg');

// Paramètres de connexion à votre base de données locale
const pool = new Pool({
  user: 'postgres', // Par exemple: 'postgres'
  host: 'localhost',
  database: 'Smash Pay', // Le nom de la DB
  password: 'Iopnjijklmj123!',
  port: 5432, // Port par défaut de PostgreSQL
});

// Pour tester la connexion (optionnel)
pool.on('connect', () => {
  console.log('Connecté à la base de données PostgreSQL!');
});

module.exports = {
  query: (text, params) => pool.query(text, params),
};