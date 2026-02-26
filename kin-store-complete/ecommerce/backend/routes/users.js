// backend/routes/users.js
const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/userController');
const { protect } = require('../middleware/auth');
const { superAdminOnly } = require('../middleware/roles');

router.use(protect, superAdminOnly);
router.get('/', ctrl.getAllUsers);
router.get('/:id', ctrl.getUser);
router.patch('/:id/role', ctrl.updateUserRole);
router.patch('/:id/toggle', ctrl.toggleUserStatus);

module.exports = router;

// ─────────────────────────────────────────────────────────────────────────────

// backend/routes/hero.js (inline for brevity)
