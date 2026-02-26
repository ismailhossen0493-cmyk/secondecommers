const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/productController');
const { protect } = require('../middleware/auth');

router.get('/', ctrl.getAllProducts);
router.get('/admin/all', protect, ctrl.adminGetAllProducts);
router.get('/:id', ctrl.getProduct);

router.post('/', protect, ctrl.createProduct);
router.patch('/:id', protect, ctrl.updateProduct);
router.delete('/:id', protect, ctrl.deleteProduct);

module.exports = router;
