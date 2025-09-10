const Book = require('../models/Book');
const fs = require('fs');

// Créer un livre
exports.createBook = (req, res, next) => {
  const bookObject = JSON.parse(req.body.book);
  delete bookObject._id;
  delete bookObject._userId;
  const book = new Book({
    ...bookObject,
    userId: req.auth.userId,
    imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
  });
  book.save()
    .then(() => res.status(201).json({ message: 'Livre enregistré !' }))
    .catch(error => res.status(400).json({ error }));
};

// GET tous les livres
exports.getAllBooks = (req, res, next) => {
  Book.find()
    .then(books => res.status(200).json(books))
    .catch(error => res.status(400).json({ error }));
};

// GET un livre
exports.getOneBook = (req, res, next) => {
  Book.findOne({ _id: req.params.id })
    .then(book => res.status(200).json(book))
    .catch(error => res.status(404).json({ error }));
};

// Modifier un livre
exports.modifyBook = (req, res, next) => {
  const bookObject = req.file ? 
    {
      ...JSON.parse(req.body.book),
      imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
    } : { ...req.body };
  
  delete bookObject._userId;

  Book.findOne({ _id: req.params.id })
    .then(book => {
      if (book.userId != req.auth.userId) {
        return res.status(403).json({ message: 'Requête non autorisée' });
      }
      if (req.file && book.imageUrl) {
        const filename = book.imageUrl.split('/images/')[1];
        fs.unlink(`images/${filename}`, () => {});
      }
      Book.updateOne({ _id: req.params.id }, { ...bookObject, _id: req.params.id })
        .then(() => res.status(200).json({ message: 'Livre modifié !' }))
        .catch(error => res.status(400).json({ error }));
    })
    .catch(error => res.status(500).json({ error }));
};

// Supprimer un livre
exports.deleteBook = (req, res, next) => {
  Book.findOne({ _id: req.params.id })
    .then(book => {
      if (book.userId != req.auth.userId) {
        res.status(403).json({ message: 'Requête non autorisée' });
      } else {
        if (book.imageUrl) {
          const filename = book.imageUrl.split('/images/')[1];
          fs.unlink(`images/${filename}`, () => {
            Book.deleteOne({ _id: req.params.id })
              .then(() => res.status(200).json({ message: 'Livre supprimé !' }))
              .catch(error => res.status(400).json({ error }));
          });
        } else {
          Book.deleteOne({ _id: req.params.id })
            .then(() => res.status(200).json({ message: 'Livre supprimé !' }))
            .catch(error => res.status(400).json({ error }));
        }
      }
    })
    .catch(error => res.status(500).json({ error }));
};



// Ajouter une note
exports.addRating = (req, res, next) => {
  const { userId, rating } = req.body;

  // Vérification que l'userId du body correspond au token
  if (userId !== req.auth.userId) {
    return res.status(403).json({ message: 'Requête non autorisée' });
  }

  // Vérification de la note
  if (rating < 0 || rating > 5) {
    return res.status(400).json({ message: 'La note doit être entre 0 et 5' });
  }

  Book.findOne({ _id: req.params.id })
    .then(book => {
      if (!book) {
        return res.status(404).json({ message: 'Livre non trouvé' });
      }

      // Un utilisateur ne peut pas noter plusieurs fois le même livre
      const alreadyRated = book.ratings.find(r => r.userId === userId);
      if (alreadyRated) {
        return res.status(400).json({ message: 'Vous avez déjà noté ce livre' });
      }

      // Ajouter la nouvelle note
      book.ratings.push({ userId, grade: rating });

      // Recalculer la moyenne
      const total = book.ratings.reduce((acc, r) => acc + r.grade, 0);
      book.averageRating = total / book.ratings.length;

      book.save()
        .then(updatedBook => res.status(200).json(updatedBook))
        .catch(error => res.status(400).json({ error }));
    })
    .catch(error => res.status(500).json({ error }));
};

exports.getBestRatedBooks = (req, res, next) => {
  Book.find().sort({ averageRating: -1 }).limit(3)
    .then(books => res.status(200).json(books))
    .catch(error => res.status(400).json({ error }));
};
