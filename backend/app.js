// const express = require('express');
// const mongoose = require('mongoose');
// require('dotenv').config();

// const app = express();

// // Middleware pour parser le JSON
// app.use(express.json());

// // Connexion à MongoDB
// mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
//   .then(() => console.log('Connexion à MongoDB réussie !'))
//   .catch(() => console.log('Connexion à MongoDB échouée !'));

// // Exemple de route
// app.get('/', (req, res) => {
//   res.json({ message: 'Bienvenue sur Mon Vieux Grimoire API 📚' });
// });

// module.exports = app;

const express = require('express');

const app = express();

app.use((req, res, next) => {
  console.log('Requête reçue !');
  next();
});

app.use((req, res, next) => {
  res.status(201);
  next();
});

app.use((req, res, next) => {
  res.json({ message: 'Votre requête a bien été reçue !' });
  next();
});

app.use((req, res, next) => {
  console.log('Réponse envoyée avec succès !');
});

module.exports = app;
