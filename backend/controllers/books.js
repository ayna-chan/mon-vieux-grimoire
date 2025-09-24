const Book = require('../models/Book');
const fs = require('fs');

// Créer un livre
exports.createBook = (req, res, next) => {
  console.log("REQ BODY ===>", req.body);
  console.log("REQ FILE ===>", req.file);

  let bookData;

  if (req.body.book) {
    try {
      bookData = JSON.parse(req.body.book);
    } catch (e) {
      return res.status(400).json({ message: 'Erreur parsing book' });
    }
  } else {
    bookData = req.body;
  }

  delete bookData._id;
  delete bookData._userId;

  const book = new Book({
    ...bookData,
    userId: req.auth.userId,
    imageUrl: req.file ? `${req.protocol}://${req.get('host')}/images/${req.file.filename}` : '',
    ratings: [],
    averageRating: 0
    // description supprimé
  });

  book.save()
    .then(() => res.status(201).json({ message: 'Livre enregistré !' }))
    .catch(error => {
      console.log('Erreur save:', error);
      res.status(400).json({ error });
    });
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
  const bookData = req.file
    ? { ...JSON.parse(req.body.book), imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}` }
    : { ...req.body };

  delete bookData._userId;

  Book.findOne({ _id: req.params.id })
    .then(book => {
      if (book.userId !== req.auth.userId) {
        return res.status(403).json({ message: 'Requête non autorisée' });
      }

      if (req.file && book.imageUrl) {
        const filename = book.imageUrl.split('/images/')[1];
        fs.unlink(`images/${filename}`, () => {});
      }

      Book.updateOne({ _id: req.params.id }, { ...bookData, _id: req.params.id })
        .then(() => res.status(200).json({ message: 'Livre modifié !' }))
        .catch(error => res.status(400).json({ error }));
    })
    .catch(error => res.status(500).json({ error }));
};

// Supprimer un livre
exports.deleteBook = (req, res, next) => {
  Book.findOne({ _id: req.params.id })
    .then(book => {
      if (book.userId !== req.auth.userId) {
        return res.status(403).json({ message: 'Requête non autorisée' });
      }

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
    })
    .catch(error => res.status(500).json({ error }));
};

// Ajouter une note
exports.addRating = (req, res, next) => {
  const userId = req.auth.userId;
  const rating = Number(req.body.rating);

  if (rating < 0 || rating > 5) {
    return res.status(400).json({ message: 'La note doit être entre 0 et 5' });
  }

  Book.findOne({ _id: req.params.id })
    .then(book => {
      if (!book) return res.status(404).json({ message: 'Livre non trouvé' });

      if (book.ratings.some(r => r.userId === userId)) {
        return res.status(403).json({ message: 'Vous avez déjà noté ce livre' });
      }

      book.ratings.push({ userId, grade: rating });

      const total = book.ratings.reduce((acc, r) => acc + r.grade, 0);
      book.averageRating = total / book.ratings.length;

      return book.save().then(updatedBook => res.status(200).json(updatedBook));
    })
    .catch(error => res.status(500).json({ error }));
};

// Récupérer les 3 meilleurs livres
exports.getBestRatedBooks = (req, res, next) => {
  Book.find()
    .sort({ averageRating: -1 })
    .limit(3)
    .then(books => res.status(200).json(books))
    .catch(error => res.status(400).json({ error }));
};

