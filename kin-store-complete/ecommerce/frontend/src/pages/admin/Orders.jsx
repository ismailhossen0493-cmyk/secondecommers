// frontend/src/pages/admin/Orders.jsx
import { useState, useEffect } from 'react';
import { MessageCircle, ChevronDown, Loader2 } from 'lucide-react';
import api from '../../utils/api';
import toast from 'react-hot-toast';
import { openWhatsApp } from '../../utils/whatsapp';

const STATUSES = ['pending','confirmed','processing','shipped','delivered','cancelled'];
const STATUS_COLORS = {
  pending: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
  confirmed: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  processing: 'bg-kin-100 text-kin-700 dark:bg-kin-900/30 dark:text-kin-400',
  shipped: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400',
  delivered: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  cancelled: 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400',
};

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');
  const [updating, setUpdating] = useState(null);
  const [expanded, setExpanded] = useState(null);

  const fetch = async () => {
    setLoading(true);
    try {
      const url = filter ? `/orders?status=${filter}` : '/orders';
      const res = await api.get(url);
      setOrders(res.data.data.orders);
    } catch { toast.error('Failed'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetch(); }, [filter]);

  const updateStatus = async (orderId, status) => {
    setUpdating(orderId);
    try {
      await api.patch(`/orders/${orderId}/status`, { status });
      toast.success(`Status: ${status}`);
      fetch();
    } catch { toast.error('Update failed'); }
    finally { setUpdating(null); }
  };

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <h1 className="font-display text-2xl font-bold">Orders</h1>
        <div className="flex gap-2 flex-wrap">
          {['', ...STATUSES].map(s => (
            <button key={s} onClick={() => setFilter(s)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all capitalize ${
                filter === s ? 'bg-kin-700 text-white' : 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:border-kin-300'
              }`}>
              {s || 'All'}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-16"><Loader2 className="animate-spin text-kin-500" size={36} /></div>
      ) : (
        <div className="space-y-3">
          {orders.map(order => (
            <div key={order._id}
              className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm overflow-hidden">
              {/* Order Header */}
              <div className="flex items-center gap-3 p-4">
                <div className="flex-1 grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div>
                    <p className="text-xs text-gray-400">Order ID</p>
                    <p className="text-sm font-bold font-mono text-kin-600 dark:text-kin-400">{order.orderId}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400">Customer</p>
                    <p className="text-sm font-semibold text-gray-800 dark:text-gray-200 truncate">{order.customerName}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400">Total</p>
                    <p className="text-sm font-bold text-gray-900 dark:text-gray-100">৳{order.total?.toLocaleString('en-BD')}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400">Status</p>
                    <span className={`inline-block text-xs font-semibold px-2 py-0.5 rounded-full capitalize ${STATUS_COLORS[order.status]}`}>
                      {order.status}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-shrink-0">
                  {/* Update Status */}
                  <select
                    value={order.status}
                    onChange={e => updateStatus(order._id, e.target.value)}
                    disabled={updating === order._id}
                    className="text-xs py-1.5 px-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 focus:outline-none focus:ring-1 focus:ring-kin-500"
                  >
                    {STATUSES.map(s => <option key={s} value={s} className="capitalize">{s}</option>)}
                  </select>

                  {/* WhatsApp */}
                  <button
                    onClick={() => openWhatsApp({
                      orderId: order.orderId,
                      customerName: order.customerName,
                      customerPhone: order.customerPhone,
                      customerAddress: order.customerAddress,
                      items: order.items || [],
                      total: order.total,
                    })}
                    className="p-1.5 rounded-lg text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 transition-colors"
                    title="Open in WhatsApp"
                  >
                    <MessageCircle size={16} />
                  </button>

                  <button onClick={() => setExpanded(expanded === order._id ? null : order._id)}
                    className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                    <ChevronDown size={14} className={`transition-transform ${expanded === order._id ? 'rotate-180' : ''}`} />
                  </button>
                </div>
              </div>

              {/* Expanded Details */}
              {expanded === order._id && (
                <div className="px-4 pb-4 border-t border-gray-50 dark:border-gray-700/50 pt-3 animate-fade-in">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-xs text-gray-400 mb-1">Contact</p>
                      <p className="font-medium">{order.customerPhone}</p>
                      {order.customerEmail && <p className="text-gray-400">{order.customerEmail}</p>}
                    </div>
                    <div>
                      <p className="text-xs text-gray-400 mb-1">Address</p>
                      <p className="font-medium">{order.customerAddress}</p>
                    </div>
                    <div className="sm:col-span-2">
                      <p className="text-xs text-gray-400 mb-2">Items</p>
                      <div className="space-y-1">
                        {order.items?.map((item, i) => (
                          <div key={i} className="flex justify-between">
                            <span className="text-gray-600 dark:text-gray-400">• {item.productName} ({item.size}) ×{item.quantity}</span>
                            <span className="font-medium">৳{(item.price * item.quantity).toLocaleString('en-BD')}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="mt-3 p-3 bg-gray-50 dark:bg-gray-700/40 rounded-xl">
                    <p className="text-xs font-mono text-gray-400 break-all whitespace-pre-wrap">{order.whatsappMessage}</p>
                  </div>
                </div>
              )}
            </div>
          ))}
          {orders.length === 0 && <div className="text-center py-12 text-gray-400">No orders found.</div>}
        </div>
      )}
    </main>
  );
}
