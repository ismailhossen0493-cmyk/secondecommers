// backend/routes/auth.js
const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/authController');
const { protect } = require('../middleware/auth');

router.post('/register', ctrl.register);
router.post('/login', ctrl.login);
router.get('/me', protect, ctrl.getMe);
router.patch('/me', protect, ctrl.updateProfile);

module.exports = router;
