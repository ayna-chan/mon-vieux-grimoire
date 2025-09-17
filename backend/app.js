require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const booksRoutes = require('./routes/books');
const userRoutes = require('./routes/user');
const app = express();

app.use(express.json());

// Middleware
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'Origin, X-Requested-With, Content, Accept, Content-Type, Authorization'
  );
  res.setHeader(
    'Access-Control-Allow-Methods',
    'GET, POST, PUT, DELETE, PATCH, OPTIONS'
  );
  next();
});

// Connexion à MongoDB
mongoose.connect('mongodb+srv://tiffany:143ILY!@cluster0.cuaklfw.mongodb.net/')
  .then(() => console.log('Connexion à MongoDB réussie !'))
  .catch(() => console.log('Connexion à MongoDB échouée !'));

// Routes
app.use('/api/books', booksRoutes);
app.use('/api/auth', userRoutes);

module.exports = app;
