// frontend/src/pages/admin/Dashboard.jsx
import { useState, useEffect } from 'react';
import { Package, ClipboardList, TrendingUp, Users, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../utils/api';

function StatCard({ title, value, icon: Icon, color, to }) {
  return (
    <Link to={to} className="group bg-white dark:bg-gray-800 rounded-2xl p-5 border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-md transition-all hover:-translate-y-0.5">
      <div className="flex items-start justify-between mb-4">
        <div className={`p-2.5 rounded-xl ${color}`}>
          <Icon size={20} className="text-white" />
        </div>
        <ArrowRight size={14} className="text-gray-300 group-hover:text-kin-500 transition-colors" />
      </div>
      <p className="text-2xl font-bold text-gray-900 dark:text-gray-100 font-display">{value ?? '…'}</p>
      <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">{title}</p>
    </Link>
  );
}

export default function AdminDashboard() {
  const { user, isSuperAdmin, canManageProducts } = useAuth();
  const [stats, setStats] = useState({});

  useEffect(() => {
    Promise.all([
      api.get('/products/admin/all').then(r => r.data.results),
      api.get('/orders').then(r => r.data.total),
      api.get('/orders?status=pending').then(r => r.data.total),
      isSuperAdmin ? api.get('/users').then(r => r.data.total) : Promise.resolve(null),
    ]).then(([products, orders, pending, users]) => {
      setStats({ products, orders, pending, users });
    }).catch(() => {});
  }, [isSuperAdmin]);

  return (
    <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <p className="text-xs font-mono uppercase tracking-widest text-kin-500 dark:text-kin-400 mb-1">Admin Panel</p>
        <h1 className="font-display text-3xl font-bold text-gray-900 dark:text-gray-100">
          Welcome, {user?.name?.split(' ')[0]}
        </h1>
        <p className="text-sm text-gray-400 mt-1 capitalize">
          Role: {user?.role?.replace('_', ' ')}
        </p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {canManageProducts && (
          <StatCard title="Total Products" value={stats.products} icon={Package} color="bg-kin-600" to="/admin/products" />
        )}
        <StatCard title="Total Orders" value={stats.orders} icon={ClipboardList} color="bg-blue-500" to="/admin/orders" />
        <StatCard title="Pending Orders" value={stats.pending} icon={TrendingUp} color="bg-amber-500" to="/admin/orders?status=pending" />
        {isSuperAdmin && (
          <StatCard title="Total Users" value={stats.users} icon={Users} color="bg-purple-500" to="/admin/users" />
        )}
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {[
          canManageProducts && { to: '/admin/products', label: 'Manage Products', desc: 'Add, edit or remove products', icon: Package, color: 'kin' },
          { to: '/admin/orders', label: 'View Orders', desc: 'Process and update order status', icon: ClipboardList, color: 'blue' },
          canManageProducts && { to: '/admin/hero', label: 'Hero Slides', desc: 'Edit homepage banner slides', icon: Package, color: 'amber' },
          isSuperAdmin && { to: '/admin/users', label: 'Manage Users', desc: 'Control roles & permissions', icon: Users, color: 'purple' },
        ].filter(Boolean).map(item => (
          <Link key={item.to} to={item.to}
            className="flex items-start gap-4 p-5 bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-md transition-all hover:-translate-y-0.5 group">
            <div className="p-2.5 rounded-xl bg-gray-50 dark:bg-gray-700">
              <item.icon size={18} className="text-gray-600 dark:text-gray-300" />
            </div>
            <div>
              <p className="font-semibold text-sm text-gray-800 dark:text-gray-200 group-hover:text-kin-600 dark:group-hover:text-kin-400 transition-colors">{item.label}</p>
              <p className="text-xs text-gray-400 mt-0.5">{item.desc}</p>
            </div>
          </Link>
        ))}
      </div>
    </main>
  );
}
