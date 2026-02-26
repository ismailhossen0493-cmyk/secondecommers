// backend/routes/products.js
const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/productController');
const { protect } = require('../middleware/auth');
const { adminOnly } = require('../middleware/roles');

router.get('/', ctrl.getAllProducts);
router.get('/admin/all', protect, adminOnly, ctrl.adminGetAllProducts);
router.get('/:id', ctrl.getProduct);

router.post('/', protect, adminOnly, ctrl.createProduct);
router.patch('/:id', protect, adminOnly, ctrl.updateProduct);
router.delete('/:id', protect, adminOnly, ctrl.deleteProduct);

module.exports = router;
