const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// Kullanıcı işlemleri için rotalar
router.post('/register', authController.register);
router.post('/login', authController.login);

module.exports = router;