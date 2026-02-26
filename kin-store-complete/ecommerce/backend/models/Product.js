// backend/models/Product.js
const mongoose = require('mongoose');

const ColorVariantSchema = new mongoose.Schema({
  name: { type: String, required: true }, // e.g. "Midnight Black"
  hex: { type: String, required: true },  // e.g. "#1a1a2e"  (picked via EyeDropper)
  images: [String],                        // image URLs for this color
  stock: { type: Number, default: 0 },
});

const SizeStockSchema = new mongoose.Schema({
  size: {
    type: String,
    required: true,
    // covers clothing (XS–5XL), shoes (EU 36–50), and free-size
    enum: ['XS', 'S', 'M', 'L', 'XL', '2XL', '3XL', '4XL', '5XL',
           '36', '37', '38', '39', '40', '41', '42', '43', '44', '45',
           '46', '47', '48', '49', '50', 'FREE SIZE', 'ONE SIZE'],
  },
  stock: { type: Number, default: 0, min: 0 },
});

const ProductSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, unique: true, lowercase: true },
    description: { type: String, required: true },
    price: { type: Number, required: true, min: 0 },
    discountPrice: { type: Number, min: 0 },

    category: {
      type: String,
      required: true,
      enum: ['shirts', 'pants', 'dresses', 'jackets', 'shoes',
             'accessories', 'bags', 'activewear', 'other'],
    },

    colors: [ColorVariantSchema],   // Colors picked via EyeDropper API

    sizes: [SizeStockSchema],       // Size × Stock matrix

    images: [String],               // General/default product images

    tags: [String],                 // e.g. ['new', 'bestseller', 'sale']

    isPreOrder: {
      type: Boolean,
      default: false,
    },
    preOrderNote: {
      type: String,
      default: 'Ships in 7–14 business days',
    },
    preOrderDeliveryDate: Date,

    isFeatured: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },

    totalStock: { type: Number, default: 0 }, // Computed field

    ratings: {
      average: { type: Number, default: 0, min: 0, max: 5 },
      count: { type: Number, default: 0 },
    },

    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

// ─── Auto-generate slug ───────────────────────────────────────────────────────
ProductSchema.pre('save', function (next) {
  if (!this.isModified('name')) return next();
  this.slug = this.name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
  next();
});

// ─── Compute totalStock ───────────────────────────────────────────────────────
ProductSchema.pre('save', function (next) {
  if (this.isModified('sizes')) {
    this.totalStock = this.sizes.reduce((sum, s) => sum + (s.stock || 0), 0);
  }
  next();
});

ProductSchema.index({ name: 'text', description: 'text', tags: 'text' });
ProductSchema.index({ category: 1, isActive: 1 });
ProductSchema.index({ isPreOrder: 1 });

module.exports = mongoose.model('Product', ProductSchema);
