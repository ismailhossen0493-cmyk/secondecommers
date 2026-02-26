// backend/controllers/productController.js
const Product = require('../models/Product');

exports.getAllProducts = async (req, res, next) => {
  try {
    const {
      category, search, minPrice, maxPrice,
      isPreOrder, isFeatured, page = 1, limit = 20, sort = '-createdAt',
    } = req.query;

    const filter = { isActive: true };
    if (category) filter.category = category;
    if (isPreOrder !== undefined) filter.isPreOrder = isPreOrder === 'true';
    if (isFeatured !== undefined) filter.isFeatured = isFeatured === 'true';
    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = Number(minPrice);
      if (maxPrice) filter.price.$lte = Number(maxPrice);
    }
    if (search) {
      filter.$text = { $search: search };
    }

    const skip = (Number(page) - 1) * Number(limit);
    const [products, total] = await Promise.all([
      Product.find(filter).sort(sort).skip(skip).limit(Number(limit)),
      Product.countDocuments(filter),
    ]);

    res.json({
      status: 'success',
      results: products.length,
      total,
      page: Number(page),
      totalPages: Math.ceil(total / Number(limit)),
      data: { products },
    });
  } catch (err) {
    next(err);
  }
};

exports.getProduct = async (req, res, next) => {
  try {
    const product = await Product.findOne({
      $or: [{ _id: req.params.id }, { slug: req.params.id }],
      isActive: true,
    });
    if (!product) {
      return res.status(404).json({ status: 'fail', message: 'Product not found.' });
    }
    res.json({ status: 'success', data: { product } });
  } catch (err) {
    next(err);
  }
};

exports.createProduct = async (req, res, next) => {
  try {
    const product = await Product.create({
      ...req.body,
      createdBy: req.user._id,
    });
    res.status(201).json({ status: 'success', data: { product } });
  } catch (err) {
    next(err);
  }
};

exports.updateProduct = async (req, res, next) => {
  try {
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      { ...req.body, updatedBy: req.user._id },
      { new: true, runValidators: true }
    );
    if (!product) return res.status(404).json({ status: 'fail', message: 'Product not found.' });
    res.json({ status: 'success', data: { product } });
  } catch (err) {
    next(err);
  }
};

exports.deleteProduct = async (req, res, next) => {
  try {
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    );
    if (!product) return res.status(404).json({ status: 'fail', message: 'Product not found.' });
    res.json({ status: 'success', message: 'Product deactivated.' });
  } catch (err) {
    next(err);
  }
};

// Admin: get all including inactive
exports.adminGetAllProducts = async (req, res, next) => {
  try {
    const products = await Product.find().sort('-createdAt').populate('createdBy', 'name');
    res.json({ status: 'success', results: products.length, data: { products } });
  } catch (err) {
    next(err);
  }
};
