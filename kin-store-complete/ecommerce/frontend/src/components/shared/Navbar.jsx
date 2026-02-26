// frontend/src/components/shared/Navbar.jsx
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ShoppingBag, Sun, Moon, Menu, X, LogOut, User,
  LayoutDashboard, Package, Image, Users, ClipboardList,
  ChevronDown,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { useTheme } from '../../context/ThemeContext';

export default function Navbar() {
  const { user, isAdmin, isSuperAdmin, adminView, toggleAdminView, logout } = useAuth();
  const { itemCount } = useCart();
  const { dark, toggle } = useTheme();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const adminLinks = [
    { to: '/admin', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/admin/products', label: 'Products', icon: Package },
    { to: '/admin/orders', label: 'Orders', icon: ClipboardList },
    { to: '/admin/hero', label: 'Hero Slides', icon: Image },
    ...(isSuperAdmin ? [{ to: '/admin/users', label: 'Users', icon: Users }] : []),
  ];

  return (
    <nav className="sticky top-0 z-50 backdrop-blur-md bg-white/80 dark:bg-gray-900/80 border-b border-kin-200/50 dark:border-gray-800/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <span className="font-display text-2xl font-bold text-kin-700 dark:text-kin-400 tracking-tight">
              KIN
            </span>
            <span className="hidden sm:block text-xs text-gray-400 dark:text-gray-500 font-body uppercase tracking-widest mt-1">
              Store
            </span>
          </Link>

          {/* Center: Admin view nav links OR Customer links */}
          <div className="hidden md:flex items-center gap-6">
            {isAdmin && adminView ? (
              adminLinks.map(({ to, label, icon: Icon }) => (
                <Link key={to} to={to}
                  className="flex items-center gap-1.5 text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-kin-600 dark:hover:text-kin-400 transition-colors">
                  <Icon size={15} />
                  {label}
                </Link>
              ))
            ) : (
              <>
                <Link to="/" className="text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-kin-600 dark:hover:text-kin-400 transition-colors">Home</Link>
                <Link to="/shop" className="text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-kin-600 dark:hover:text-kin-400 transition-colors">Shop</Link>
                <Link to="/track" className="text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-kin-600 dark:hover:text-kin-400 transition-colors">Track Order</Link>
              </>
            )}
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-3">

            {/* Admin/Customer Toggle — only visible to admin users */}
            {isAdmin && (
              <button
                onClick={toggleAdminView}
                title={adminView ? 'Switch to Customer View' : 'Switch to Admin Panel'}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-kin-500 focus:ring-offset-2 ${
                  adminView ? 'bg-kin-600' : 'bg-gray-300 dark:bg-gray-600'
                }`}
              >
                <span className="sr-only">Toggle admin view</span>
                <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-lg transition-transform ${
                  adminView ? 'translate-x-6' : 'translate-x-1'
                }`} />
              </button>
            )}
            {isAdmin && (
              <span className="hidden sm:block text-xs font-mono text-gray-400 dark:text-gray-500">
                {adminView ? 'ADMIN' : 'STORE'}
              </span>
            )}

            {/* Theme Toggle */}
            <button
              onClick={toggle}
              className="p-2 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-kin-100 dark:hover:bg-gray-700 transition-all"
            >
              {dark ? <Sun size={16} /> : <Moon size={16} />}
            </button>

            {/* Cart */}
            {!adminView && (
              <Link to="/shop" className="relative p-2 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-kin-100 dark:hover:bg-gray-700 transition-all">
                <ShoppingBag size={16} />
                {itemCount > 0 && (
                  <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-kin-600 text-white text-[10px] font-bold flex items-center justify-center">
                    {itemCount > 9 ? '9+' : itemCount}
                  </span>
                )}
              </Link>
            )}

            {/* Profile / Auth */}
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setProfileOpen(o => !o)}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-kin-100 dark:bg-kin-900/40 text-kin-700 dark:text-kin-400 text-sm font-medium hover:bg-kin-200 dark:hover:bg-kin-900/60 transition-all"
                >
                  <User size={14} />
                  <span className="hidden sm:block max-w-[80px] truncate">{user.name.split(' ')[0]}</span>
                  <ChevronDown size={12} />
                </button>

                {profileOpen && (
                  <div className="absolute right-0 mt-2 w-48 rounded-2xl shadow-xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 py-2 animate-slide-in-up">
                    <div className="px-4 py-2 border-b border-gray-100 dark:border-gray-700">
                      <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">{user.role.replace('_', ' ')}</p>
                      <p className="text-sm font-semibold text-gray-800 dark:text-gray-200 truncate">{user.email}</p>
                    </div>
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                    >
                      <LogOut size={14} />
                      Sign out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link to="/login"
                className="px-4 py-1.5 rounded-xl bg-kin-700 text-white text-sm font-medium hover:bg-kin-800 transition-all shadow-md shadow-kin-200 dark:shadow-none">
                Sign in
              </Link>
            )}

            {/* Mobile menu */}
            <button
              className="md:hidden p-2 rounded-xl bg-gray-100 dark:bg-gray-800"
              onClick={() => setMobileOpen(o => !o)}
            >
              {mobileOpen ? <X size={16} /> : <Menu size={16} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-gray-100 dark:border-gray-800 bg-white/95 dark:bg-gray-900/95 backdrop-blur-md px-4 py-3 space-y-1 animate-fade-in">
          {(isAdmin && adminView ? adminLinks.map(l => ({ to: l.to, label: l.label })) : [
            { to: '/', label: 'Home' },
            { to: '/shop', label: 'Shop' },
            { to: '/track', label: 'Track Order' },
          ]).map(({ to, label }) => (
            <Link key={to} to={to}
              onClick={() => setMobileOpen(false)}
              className="block px-3 py-2 rounded-lg text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-kin-50 dark:hover:bg-gray-800 transition-colors">
              {label}
            </Link>
          ))}
        </div>
      )}
    </nav>
  );
}
