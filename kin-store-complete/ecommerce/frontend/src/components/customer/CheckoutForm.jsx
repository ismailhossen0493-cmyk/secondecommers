// frontend/src/components/customer/CheckoutForm.jsx
import { useState } from 'react';
import { MessageCircle, Loader2, CheckCircle } from 'lucide-react';
import api from '../../utils/api';
import { openWhatsApp } from '../../utils/whatsapp';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

const SHIPPING_FEE = 60;

export default function CheckoutForm({ items, total, onSuccess }) {
  const { user } = useAuth();
  const [form, setForm] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    address: '',
    email: user?.email || '',
  });
  const [loading, setLoading] = useState(false);
  const [order, setOrder] = useState(null);

  const grandTotal = total + SHIPPING_FEE;

  const handle = (e) => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.phone || !form.address) {
      toast.error('Please fill all required fields');
      return;
    }

    setLoading(true);
    try {
      const res = await api.post('/orders', {
        customerName: form.name,
        customerPhone: form.phone,
        customerAddress: form.address,
        customerEmail: form.email,
        items: items.map(i => ({
          productId: i.productId,
          size: i.size,
          color: i.color,
          colorHex: i.colorHex,
          quantity: i.quantity,
        })),
        shippingFee: SHIPPING_FEE,
      });

      const { order: newOrder, whatsappUrl } = res.data.data;
      setOrder(newOrder);

      // Open WhatsApp automatically
      window.open(whatsappUrl, '_blank');
      toast.success(`Order ${newOrder.orderId} placed! Opening WhatsApp…`);
      if (onSuccess) onSuccess(newOrder);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Order failed. Try again.');
    } finally {
      setLoading(false);
    }
  };

  if (order) {
    return (
      <div className="text-center py-12">
        <CheckCircle className="mx-auto text-green-500 mb-4" size={56} />
        <h2 className="font-display text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">Order Placed!</h2>
        <p className="text-gray-500 dark:text-gray-400 mb-2">Your order ID: <strong className="text-kin-600 dark:text-kin-400">{order.orderId}</strong></p>
        <p className="text-sm text-gray-400 mb-6">WhatsApp opened with your order details. Please send the message to confirm.</p>
        <button
          onClick={() => openWhatsApp({
            orderId: order.orderId,
            customerName: order.customerName,
            customerPhone: order.customerPhone,
            customerAddress: order.customerAddress,
            items: order.items,
            total: order.total,
            shippingFee: SHIPPING_FEE,
          })}
          className="inline-flex items-center gap-2 px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-xl font-medium transition-all"
        >
          <MessageCircle size={18} />
          Send on WhatsApp Again
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <h2 className="font-display text-xl font-bold text-gray-900 dark:text-gray-100">Checkout</h2>

      {/* Form Fields */}
      {[
        { name: 'name', label: 'Full Name', placeholder: 'Rafiq Hasan', required: true },
        { name: 'phone', label: 'Phone Number', placeholder: '01XXXXXXXXX', required: true, type: 'tel' },
        { name: 'email', label: 'Email (optional)', placeholder: 'you@example.com', required: false, type: 'email' },
      ].map(field => (
        <div key={field.name}>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
            {field.label} {field.required && <span className="text-red-500">*</span>}
          </label>
          <input
            name={field.name}
            type={field.type || 'text'}
            placeholder={field.placeholder}
            value={form[field.name]}
            onChange={handle}
            required={field.required}
            className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-kin-500 transition-all"
          />
        </div>
      ))}

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
          Delivery Address <span className="text-red-500">*</span>
        </label>
        <textarea
          name="address"
          placeholder="House #, Road #, Area, City, District"
          value={form.address}
          onChange={handle}
          required
          rows={3}
          className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-kin-500 transition-all resize-none"
        />
      </div>

      {/* Order Summary */}
      <div className="bg-kin-50 dark:bg-gray-800/60 rounded-xl p-4 space-y-2">
        <h3 className="font-semibold text-sm text-gray-700 dark:text-gray-300 mb-3">Order Summary</h3>
        {items.map(item => (
          <div key={item.key} className="flex justify-between text-sm">
            <span className="text-gray-600 dark:text-gray-400">
              {item.productName} ({item.size}) × {item.quantity}
            </span>
            <span className="font-medium">৳{(item.price * item.quantity).toLocaleString('en-BD')}</span>
          </div>
        ))}
        <div className="border-t border-kin-200 dark:border-gray-700 pt-2 flex justify-between text-sm">
          <span className="text-gray-500">Shipping</span>
          <span>৳{SHIPPING_FEE}</span>
        </div>
        <div className="flex justify-between font-bold text-base">
          <span>Total</span>
          <span className="text-kin-700 dark:text-kin-400">৳{grandTotal.toLocaleString('en-BD')}</span>
        </div>
      </div>

      <button
        type="submit"
        disabled={loading || items.length === 0}
        className="w-full flex items-center justify-center gap-3 py-3.5 bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white font-semibold rounded-xl text-sm transition-all shadow-lg shadow-green-200/50 dark:shadow-none"
      >
        {loading ? <Loader2 size={18} className="animate-spin" /> : <MessageCircle size={18} />}
        {loading ? 'Placing order…' : 'Place Order via WhatsApp'}
      </button>

      <p className="text-xs text-center text-gray-400 dark:text-gray-500">
        Your order details will be sent to our WhatsApp for confirmation.
      </p>
    </form>
  );
}
