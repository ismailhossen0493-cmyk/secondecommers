// backend/routes/orders.js
const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/orderController');
const { protect, optionalAuth } = require('../middleware/auth');
const { adminOnly, superAdminOnly } = require('../middleware/roles');

router.post('/', optionalAuth, ctrl.createOrder);
router.get('/track', ctrl.trackOrder); // Public: orderId + phone
router.get('/my', protect, ctrl.getMyOrders);
router.get('/', protect, adminOnly, ctrl.getAllOrders);
router.get('/:id', optionalAuth, ctrl.getOrder);
router.patch('/:id/status', protect, adminOnly, ctrl.updateOrderStatus);

module.exports = router;
