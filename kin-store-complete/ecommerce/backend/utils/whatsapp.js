// backend/utils/whatsapp.js

const WHATSAPP_NUMBER = process.env.WHATSAPP_NUMBER || '8801XXXXXXXXX'; // Store number

/**
 * Formats an order into the exact KIN WhatsApp message format.
 *
 * Output example:
 *   ORDER #KIN-00042: Kin!
 *   Name: Rifat Hasan
 *   Phone: 01700000000
 *   Address: 12 Mirpur Road, Dhaka
 *   Items:
 *   • Classic Linen Shirt (M) (x2) - ৳1,400
 *   • Cargo Pants (32) (x1) - ৳2,200
 *   Total: ৳4,999
 *
 * @param {Object} orderData
 * @param {string} orderData.orderId
 * @param {string} orderData.customerName
 * @param {string} orderData.customerPhone
 * @param {string} orderData.customerAddress
 * @param {Array}  orderData.items
 * @param {number} orderData.total
 * @param {number} [orderData.shippingFee]
 * @param {number} [orderData.discount]
 * @returns {string} formatted WhatsApp message
 */
function formatWhatsAppOrder({
  orderId,
  customerName,
  customerPhone,
  customerAddress,
  items = [],
  total,
  shippingFee = 0,
  discount = 0,
}) {
  const formatCurrency = (amount) =>
    `৳${Number(amount).toLocaleString('en-BD')}`;

  const itemLines = items
    .map((item) => {
      const name = item.productName || item.name || 'Unknown Item';
      const size = item.size || 'N/A';
      const qty = item.quantity || 1;
      const price = item.price * qty;
      return `• ${name} (${size}) (x${qty}) - ${formatCurrency(price)}`;
    })
    .join('\n');

  let message = `ORDER #${orderId}: Kin!\n`;
  message += `Name: ${customerName}\n`;
  message += `Phone: ${customerPhone}\n`;
  message += `Address: ${customerAddress}\n`;
  message += `Items:\n${itemLines}\n`;

  if (shippingFee > 0) {
    message += `Shipping: ${formatCurrency(shippingFee)}\n`;
  }
  if (discount > 0) {
    message += `Discount: -${formatCurrency(discount)}\n`;
  }

  message += `Total: ${formatCurrency(total)}`;

  return message;
}

/**
 * Generates a WhatsApp click-to-chat URL with the pre-filled order message.
 * @param {Object} orderData - same as formatWhatsAppOrder
 * @param {string} [phoneNumber] - override store phone number
 * @returns {string} WhatsApp URL
 */
function getWhatsAppURL(orderData, phoneNumber = WHATSAPP_NUMBER) {
  const message = formatWhatsAppOrder(orderData);
  const encoded = encodeURIComponent(message);
  // Remove leading + or 0 and add country code if needed
  const cleanPhone = phoneNumber.replace(/^\+/, '').replace(/^0/, '880');
  return `https://wa.me/${cleanPhone}?text=${encoded}`;
}

/**
 * Validates that the required order fields are present.
 * @param {Object} orderData
 * @returns {{ valid: boolean, errors: string[] }}
 */
function validateOrderForWhatsApp(orderData) {
  const errors = [];
  if (!orderData.customerName?.trim()) errors.push('Customer name is required');
  if (!orderData.customerPhone?.trim()) errors.push('Customer phone is required');
  if (!orderData.customerAddress?.trim()) errors.push('Customer address is required');
  if (!orderData.items?.length) errors.push('Order must have at least one item');
  if (!orderData.total || orderData.total <= 0) errors.push('Order total must be greater than 0');
  return { valid: errors.length === 0, errors };
}

module.exports = {
  formatWhatsAppOrder,
  getWhatsAppURL,
  validateOrderForWhatsApp,
};
