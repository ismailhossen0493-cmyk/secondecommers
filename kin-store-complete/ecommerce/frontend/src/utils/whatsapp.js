// frontend/src/utils/whatsapp.js

const STORE_WHATSAPP = import.meta.env.VITE_WHATSAPP_NUMBER || '8801XXXXXXXXX';

/**
 * Format order into KIN WhatsApp message
 */
export function formatOrderMessage({ orderId, customerName, customerPhone, customerAddress, items, total, shippingFee = 0, discount = 0 }) {
  const fmt = (n) => `৳${Number(n).toLocaleString('en-BD')}`;

  const itemLines = items
    .map(item => `• ${item.productName} (${item.size}) (x${item.quantity}) - ${fmt(item.price * item.quantity)}`)
    .join('\n');

  let msg = `ORDER #${orderId}: Kin!\n`;
  msg += `Name: ${customerName}\n`;
  msg += `Phone: ${customerPhone}\n`;
  msg += `Address: ${customerAddress}\n`;
  msg += `Items:\n${itemLines}\n`;
  if (shippingFee > 0) msg += `Shipping: ${fmt(shippingFee)}\n`;
  if (discount > 0) msg += `Discount: -${fmt(discount)}\n`;
  msg += `Total: ${fmt(total)}`;

  return msg;
}

export function openWhatsApp(orderData, phone = STORE_WHATSAPP) {
  const msg = formatOrderMessage(orderData);
  const cleanPhone = phone.replace(/^\+/, '').replace(/^0/, '880');
  const url = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(msg)}`;
  window.open(url, '_blank');
}
