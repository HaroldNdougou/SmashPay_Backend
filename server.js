const express = require('express');
const cors = require('cors');
const { query } = require('./db'); // Importation de la connexion à la DB

const app = express();
const PORT = 3000; // Le port que vous utiliserez dans React Native (ex: http://192.168.1.10:3000)

// Middlewares
// 1. CORS: Autorise l'accès depuis d'autres origines (votre app mobile)
app.use(cors());
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
  
  // NOTE IMPORTANTE DE SÉCURITÉ :
  // Le code_secret doit être HACHÉ ici avant d'être inséré en DB.
  // Pour la simplicité de l'exemple, nous l'insérons tel quel,
  // mais utilisez toujours une librairie comme 'bcrypt' en production!
  const secretHash = code_secret; // Remplacer par bcrypt.hash(code_secret, 10)

  try {
    const text = `
      INSERT INTO clients (numero_de_telephone, code_secret, prenom) 
      VALUES ($1, $2, $3) 
      RETURNING *
    `;
    const values = [numero_de_telephone, secretHash, prenom];
    
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