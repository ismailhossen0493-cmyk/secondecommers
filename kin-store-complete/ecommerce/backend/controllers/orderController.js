// backend/controllers/orderController.js
const Order = require('../models/Order');
const Product = require('../models/Product');
const { getWhatsAppURL, validateOrderForWhatsApp } = require('../utils/whatsapp');

exports.createOrder = async (req, res, next) => {
  try {
    const {
      customerName, customerPhone, customerAddress, customerEmail,
      items, shippingFee = 60, discount = 0, notes,
    } = req.body;

    // Validate items & build order items with snapshots
    const orderItems = [];
    let subtotal = 0;

    for (const item of items) {
      const product = await Product.findById(item.productId);
      if (!product || !product.isActive) {
        return res.status(400).json({
          status: 'fail',
          message: `Product not found: ${item.productId}`,
        });
      }

      // Check size stock (optional but recommended)
      const sizeEntry = product.sizes.find((s) => s.size === item.size);
      if (sizeEntry && sizeEntry.stock < item.quantity) {
        return res.status(400).json({
          status: 'fail',
          message: `Not enough stock for ${product.name} (${item.size})`,
        });
      }

      const price = product.discountPrice || product.price;
      subtotal += price * item.quantity;

      orderItems.push({
        product: product._id,
        productName: product.name,
        size: item.size,
        color: item.color,
        colorHex: item.colorHex,
        quantity: item.quantity,
        price,
      });
    }

    const total = subtotal + shippingFee - discount;

    const orderData = {
      customerName, customerPhone, customerAddress, customerEmail,
      items: orderItems, subtotal, shippingFee, discount, total, notes,
      user: req.user?._id,
    };

    // Validate WhatsApp format before saving
    const validation = validateOrderForWhatsApp({
      ...orderData,
      orderId: 'TEMP',
      items: orderItems,
    });
    if (!validation.valid) {
      return res.status(400).json({ status: 'fail', errors: validation.errors });
    }

    const order = await Order.create(orderData);

    // Deduct stock
    for (const item of orderItems) {
      await Product.updateOne(
        { _id: item.product, 'sizes.size': item.size },
        { $inc: { 'sizes.$.stock': -item.quantity, totalStock: -item.quantity } }
      );
    }

    // Generate WhatsApp URL with the saved order
    const waUrl = getWhatsAppURL({
      orderId: order.orderId,
      customerName: order.customerName,
      customerPhone: order.customerPhone,
      customerAddress: order.customerAddress,
      items: order.items,
      total: order.total,
      shippingFee: order.shippingFee,
      discount: order.discount,
    });

    res.status(201).json({
      status: 'success',
      data: {
        order,
        whatsappUrl: waUrl,
        whatsappMessage: order.whatsappMessage,
      },
    });
  } catch (err) {
    next(err);
  }
};

exports.getOrder = async (req, res, next) => {
  try {
    const order = await Order.findOne({
      $or: [{ _id: req.params.id }, { orderId: req.params.id }],
    }).populate('items.product', 'name images');

    if (!order) return res.status(404).json({ status: 'fail', message: 'Order not found.' });

    // Only allow owner or admin
    if (
      req.user &&
      order.user &&
      order.user.toString() !== req.user._id.toString() &&
      !['inventory_manager', 'super_admin'].includes(req.user.role)
    ) {
      return res.status(403).json({ status: 'fail', message: 'Access denied.' });
    }

    res.json({ status: 'success', data: { order } });
  } catch (err) {
    next(err);
  }
};

exports.trackOrder = async (req, res, next) => {
  try {
    const { orderId, phone } = req.query;
    const order = await Order.findOne({ orderId })
      .select('orderId status statusHistory total items customerName createdAt trackingCode');

    if (!order || order.customerPhone !== phone) {
      return res.status(404).json({ status: 'fail', message: 'Order not found. Check Order ID and phone number.' });
    }

    res.json({ status: 'success', data: { order } });
  } catch (err) {
    next(err);
  }
};

exports.getAllOrders = async (req, res, next) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const filter = {};
    if (status) filter.status = status;

    const skip = (page - 1) * limit;
    const [orders, total] = await Promise.all([
      Order.find(filter).sort('-createdAt').skip(skip).limit(Number(limit)),
      Order.countDocuments(filter),
    ]);

    res.json({ status: 'success', results: orders.length, total, data: { orders } });
  } catch (err) {
    next(err);
  }
};

exports.updateOrderStatus = async (req, res, next) => {
  try {
    const { status, note, trackingCode } = req.body;
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ status: 'fail', message: 'Order not found.' });

    order.status = status;
    if (trackingCode) order.trackingCode = trackingCode;
    order.statusHistory.push({ status, note, changedBy: req.user._id });
    await order.save();

    res.json({ status: 'success', data: { order } });
  } catch (err) {
    next(err);
  }
};

exports.getMyOrders = async (req, res, next) => {
  try {
    const orders = await Order.find({ user: req.user._id }).sort('-createdAt');
    res.json({ status: 'success', data: { orders } });
  } catch (err) {
    next(err);
  }
};
