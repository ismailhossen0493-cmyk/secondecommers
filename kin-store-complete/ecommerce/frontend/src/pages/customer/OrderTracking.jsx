// frontend/src/pages/customer/OrderTracking.jsx
import { useState } from 'react';
import { Search, Package, CheckCircle, Truck, Clock, XCircle, Loader2 } from 'lucide-react';
import api from '../../utils/api';

const STATUS_CONFIG = {
  pending: { label: 'Pending', icon: Clock, color: 'text-yellow-500', bg: 'bg-yellow-50 dark:bg-yellow-900/20' },
  confirmed: { label: 'Confirmed', icon: CheckCircle, color: 'text-blue-500', bg: 'bg-blue-50 dark:bg-blue-900/20' },
  processing: { label: 'Processing', icon: Package, color: 'text-kin-600', bg: 'bg-kin-50 dark:bg-kin-900/20' },
  shipped: { label: 'Shipped', icon: Truck, color: 'text-indigo-500', bg: 'bg-indigo-50 dark:bg-indigo-900/20' },
  delivered: { label: 'Delivered', icon: CheckCircle, color: 'text-green-500', bg: 'bg-green-50 dark:bg-green-900/20' },
  cancelled: { label: 'Cancelled', icon: XCircle, color: 'text-red-500', bg: 'bg-red-50 dark:bg-red-900/20' },
};

export default function OrderTracking() {
  const [form, setForm] = useState({ orderId: '', phone: '' });
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const track = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setOrder(null);
    try {
      const res = await api.get(`/orders/track?orderId=${form.orderId}&phone=${form.phone}`);
      setOrder(res.data.data.order);
    } catch (err) {
      setError(err.response?.data?.message || 'Order not found');
    } finally { setLoading(false); }
  };

  const statusConf = order ? (STATUS_CONFIG[order.status] || STATUS_CONFIG.pending) : null;

  return (
    <main className="max-w-xl mx-auto px-4 sm:px-6 py-12">
      <div className="text-center mb-8">
        <h1 className="font-display text-3xl font-bold text-gray-900 dark:text-gray-100">Track Your Order</h1>
        <p className="text-sm text-gray-400 mt-1.5">Enter your Order ID and phone number</p>
      </div>

      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm p-6 mb-6">
        <form onSubmit={track} className="space-y-3">
          <input value={form.orderId} onChange={e => setForm(f => ({ ...f, orderId: e.target.value }))} required
            placeholder="Order ID (e.g. KIN-00001)"
            className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-kin-500" />
          <input type="tel" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} required
            placeholder="Phone number used at checkout"
            className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-kin-500" />
          <button type="submit" disabled={loading}
            className="w-full flex items-center justify-center gap-2 py-3 bg-kin-700 hover:bg-kin-800 text-white font-semibold rounded-xl transition-all disabled:opacity-50">
            {loading ? <Loader2 size={16} className="animate-spin" /> : <Search size={16} />}
            {loading ? 'Searching…' : 'Track Order'}
          </button>
        </form>
      </div>

      {error && (
        <div className="p-4 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-xl text-sm text-center">
          {error}
        </div>
      )}

      {order && statusConf && (
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden animate-slide-in-up">
          <div className={`p-5 flex items-center gap-3 ${statusConf.bg}`}>
            <statusConf.icon size={24} className={statusConf.color} />
            <div>
              <p className="font-bold text-gray-900 dark:text-gray-100">{order.orderId}</p>
              <p className={`text-sm font-semibold ${statusConf.color}`}>{statusConf.label}</p>
            </div>
          </div>

          <div className="p-5 space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Customer</span>
              <span className="font-medium text-gray-800 dark:text-gray-200">{order.customerName}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Order Date</span>
              <span className="font-medium text-gray-800 dark:text-gray-200">{new Date(order.createdAt).toLocaleDateString('en-BD', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
            </div>
            {order.trackingCode && (
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Tracking Code</span>
                <span className="font-mono font-bold text-kin-600 dark:text-kin-400">{order.trackingCode}</span>
              </div>
            )}
            <div className="border-t border-gray-100 dark:border-gray-800 pt-3">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Items</p>
              {order.items?.map((item, i) => (
                <div key={i} className="flex justify-between text-sm py-1">
                  <span className="text-gray-600 dark:text-gray-400">{item.productName} ({item.size}) ×{item.quantity}</span>
                  <span className="font-medium">৳{(item.price * item.quantity).toLocaleString('en-BD')}</span>
                </div>
              ))}
              <div className="flex justify-between font-bold text-sm pt-2 border-t border-gray-50 dark:border-gray-800 mt-1">
                <span>Total</span>
                <span className="text-kin-700 dark:text-kin-400">৳{order.total?.toLocaleString('en-BD')}</span>
              </div>
            </div>

            {/* Status history */}
            {order.statusHistory?.length > 0 && (
              <div className="border-t border-gray-100 dark:border-gray-800 pt-3">
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Timeline</p>
                <div className="space-y-1.5">
                  {[...order.statusHistory].reverse().map((h, i) => (
                    <div key={i} className="flex items-start gap-2 text-xs">
                      <div className="w-1.5 h-1.5 rounded-full bg-kin-400 mt-1.5 flex-shrink-0" />
                      <div>
                        <span className="font-semibold capitalize">{h.status}</span>
                        {h.note && <span className="text-gray-400 ml-1">— {h.note}</span>}
                        <p className="text-gray-400">{new Date(h.changedAt).toLocaleString('en-BD')}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </main>
  );
}
