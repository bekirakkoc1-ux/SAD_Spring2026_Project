const express = require('express');
const router = express.Router();
const clubController = require('../controllers/clubController');
const auth = require('../middleware/authMiddleware');

// Tüm bu rotalara sadece giriş yapmış (token'ı olan) kullanıcılar erişebilir
router.post('/', auth, clubController.createClub);
router.get('/', auth, clubController.getClubs);
router.put('/:id', auth, clubController.updateClub);
router.delete('/:id', auth, clubController.deleteClub);

module.exports = router;