const { Pool } = require('pg');

// 1. Charger les variables d'environnement
// Si ce n'est pas déjà fait ailleurs (ex: dans server.js), il est crucial de le faire ici.
// Cela permet à process.env.DATABASE_URL d'être défini.
require('dotenv').config();

// 2. Utiliser la chaîne de connexion unique de Neon
// Cette chaîne est lue à partir du fichier .env que vous avez créé.
const pool = new Pool({
  connectionString: process.env.DATABASE_URL, // ⬅️ Utilisation de la variable d'environnement
  ssl: {
    // Neon requiert le SSL. Cette ligne peut être nécessaire en développement.
    rejectUnauthorized: false
  }
});

// Pour tester la connexion (optionnel)
pool.on('connect', () => {
  console.log('Connecté à la base de données NEON PostgreSQL!');
});

// Gestion des erreurs de pool
pool.on('error', (err) => {
  console.error('Erreur inattendue sur le pool de connexion', err);
  process.exit(-1); // Quitter le processus en cas d'erreur grave
});

module.exports = {
  query: (text, params) => pool.query(text, params),
};