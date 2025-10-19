const express = require('express');
const cors = require('cors');
const { query } = require('./db'); // Importation de la connexion à la DB
const sanitizeHtml = require('sanitize-html');

const app = express();
// 1. CORS: Autorise l'accès depuis d'autres origines (votre app mobile)
app.use(cors());
const PORT = '3000'; // Le port que vous utiliserez dans React Native (ex: http://192.168.1.10:3000)

// Middlewares

// 2. Body Parser: Permet à Express de lire le JSON envoyé dans le corps des requêtes POST
app.use(express.json());

// ----------------------------------------------------------------------
// POINT DE TERMINAISON (ENDPOINT) : POST /api/clients
// ----------------------------------------------------------------------
app.post('/api/clients', async (req, res) => {
  // Récupération des données envoyées par l'application React Native
  const { numero_de_telephone, code_secret, prenom } = req.body;

  // Validation simple
  if (!numero_de_telephone || !code_secret || !prenom) {
    return res.status(400).json({ error: 'Tous les champs sont requis.' });
  }

  if (numero_de_telephone.length !== 9 || !/^\d{9}$/.test(numero_de_telephone)) {
    return res.status(400).json({ error: 'Numéro de téléphone incorrect.' });
  }

  if (code_secret.length !== 4 || !/^\d{4}$/.test(code_secret)) {
    return res.status(400).json({ error: 'Code secret incorrect.' });
  }

  // 1. Vérification du type (doit être une chaîne) et de la présence
  if (typeof prenom !== 'string') {
      return res.status(400).json({ error: 'Prénom erroné' });
  }
  // 2. Vérification stricte de la longueur
  if (prenom.length > 20) {
      return res.status(400).json({ error: 'Le prénom est trop long.' });
  }

  // 3. NETTOYAGE : Suppression de tout code HTML/JS
    const safePrenom = sanitizeHtml(prenom, {
        allowedTags: [], // N'autoriser AUCUNE balise HTML
        allowedAttributes: {}, // N'autoriser AUCUN attribut
        // Optionnel : Tronquer les espaces inutiles
    }).trim();
    const safeNumeroTelephone = sanitizeHtml(numero_de_telephone, {
        allowedTags: [], // N'autoriser AUCUNE balise HTML
        allowedAttributes: {}, // N'autoriser AUCUN attribut
        // Optionnel : Tronquer les espaces inutiles
    }).trim();
    const safeCodeSecret = sanitizeHtml(code_secret, {
        allowedTags: [], // N'autoriser AUCUNE balise HTML
        allowedAttributes: {}, // N'autoriser AUCUN attribut
        // Optionnel : Tronquer les espaces inutiles
    }).trim();
  
  
  const secretHash = code_secret; // Remplacer par bcrypt.hash(code_secret, 10)

  try {
    const text = `
      INSERT INTO customers (phone_number, secret_code_hash, first_name) 
      VALUES ($1, $2, $3) 
      RETURNING *
    `;
    const values = [safeNumeroTelephone, safeCodeSecret, safePrenom];
    
    // Exécution de la requête d'insertion dans PostgreSQL
    const result = await query(text, values);

    // Réponse réussie (201 Created)
    res.status(201).json({ 
        message: 'Client enregistré avec succès!', 
        client: result.rows[0] 
    });
  } catch (err) {
    console.error('Erreur lors de l\'insertion du client:', err);
    
    // Gérer l'erreur de doublon de numéro de téléphone (UNIQUE constraint)
    if (err.code === '23505') { 
        return res.status(409).json({ error: 'Ce numéro de téléphone est déjà enregistré.' });
    }

    // Erreur interne du serveur
    res.status(500).json({ error: 'Erreur interne du serveur.' });
  }
});

// Démarrage du serveur
app.listen(PORT, () => {
  console.log(`Serveur démarré sur le port ${PORT}`);
  console.log(`Endpoint POST disponible à: http://localhost:${PORT}/api/clients`);
});