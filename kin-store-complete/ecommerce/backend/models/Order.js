// backend/models/Order.js
const mongoose = require('mongoose');
const { formatWhatsAppOrder } = require('../utils/whatsapp');

const OrderItemSchema = new mongoose.Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  productName: { type: String, required: true }, // snapshot at order time
  size: { type: String, required: true },
  color: { type: String },
  colorHex: { type: String },
  quantity: { type: Number, required: true, min: 1 },
  price: { type: Number, required: true }, // snapshot
});

const OrderSchema = new mongoose.Schema(
  {
    orderId: {
      type: String,
      unique: true,
    },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // optional guest

    // Guest / collected at checkout
    customerName: { type: String, required: true },
    customerPhone: { type: String, required: true },
    customerAddress: { type: String, required: true },
    customerEmail: String,

    items: [OrderItemSchema],

    subtotal: { type: Number, required: true },
    shippingFee: { type: Number, default: 0 },
    discount: { type: Number, default: 0 },
    total: { type: Number, required: true },

    status: {
      type: String,
      enum: ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded'],
      default: 'pending',
    },

    paymentMethod: {
      type: String,
      enum: ['whatsapp', 'bkash', 'nagad', 'rocket', 'cod', 'card'],
      default: 'whatsapp',
    },
    paymentStatus: {
      type: String,
      enum: ['unpaid', 'partial', 'paid', 'refunded'],
      default: 'unpaid',
    },

    trackingCode: String,
    notes: String,
    adminNotes: String,

    statusHistory: [
      {
        status: String,
        note: String,
        changedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        changedAt: { type: Date, default: Date.now },
      },
    ],

    whatsappMessage: String, // cached formatted message
  },
  { timestamps: true }
);

// ─── Auto-generate orderId ────────────────────────────────────────────────────
OrderSchema.pre('save', async function (next) {
  if (this.isNew) {
    const count = await mongoose.model('Order').countDocuments();
    this.orderId = `KIN-${String(count + 1).padStart(5, '0')}`;

    // Generate and cache WhatsApp message
    this.whatsappMessage = formatWhatsAppOrder({
      orderId: this.orderId,
      customerName: this.customerName,
      customerPhone: this.customerPhone,
      customerAddress: this.customerAddress,
      items: this.items,
      total: this.total,
    });
  }
  next();
});

OrderSchema.index({ orderId: 1 });
OrderSchema.index({ user: 1 });
OrderSchema.index({ status: 1 });
OrderSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Order', OrderSchema);
