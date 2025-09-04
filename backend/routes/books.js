const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const booksCtrl = require('../controllers/books');

// Routes publiques
router.get('/', booksCtrl.getAllBooks);
router.get('/:id', booksCtrl.getOneBook);

// Routes avec authentification
router.post('/', auth, booksCtrl.createBook);
router.put('/:id', auth, booksCtrl.modifyBook);
router.delete('/:id', auth, booksCtrl.deleteBook);

module.exports = router;
