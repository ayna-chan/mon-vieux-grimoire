const express = require('express');
const mongoose = require('mongoose');
require('dotenv').config();

const app = express();

// Middleware pour parser le JSON
app.use(express.json());

// Connexion à MongoDB
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('Connexion MongoDB réussie !'))
.catch(err => console.log('Erreur MongoDB :', err));

// Test route
app.get('/', (req, res) => {
  res.send('API Mon Vieux Grimoire en ligne 🚀');
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Serveur lancé sur le port ${PORT}`));
