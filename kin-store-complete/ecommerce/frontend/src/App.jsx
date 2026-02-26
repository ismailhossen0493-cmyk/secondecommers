// frontend/src/App.jsx
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { ThemeProvider } from './context/ThemeContext';

// Customer Pages
import Home from './pages/customer/Home';
import Shop from './pages/customer/Shop';
import ProductDetail from './pages/customer/ProductDetail';
import OrderTracking from './pages/customer/OrderTracking';
import LoginPage from './pages/customer/LoginPage';

// Admin Pages
import AdminDashboard from './pages/admin/Dashboard';
import AdminProducts from './pages/admin/Products';
import AdminOrders from './pages/admin/Orders';
import AdminHeroSlides from './pages/admin/HeroSlides';
import AdminUsers from './pages/admin/Users';

import Navbar from './components/shared/Navbar';

function AdminRoute({ children, superOnly = false }) {
  const { user, isAdmin, isSuperAdmin, loading } = useAuth();
  if (loading) return <div className="h-screen flex items-center justify-center">Loading…</div>;
  if (!user || (!isAdmin && !superOnly)) return <Navigate to="/" />;
  if (superOnly && !isSuperAdmin) return <Navigate to="/admin" />;
  return children;
}

function AppRoutes() {
  const { adminView, isAdmin } = useAuth();

  return (
    <>
      <Navbar />
      <Routes>
        {/* Customer Routes */}
        <Route path="/" element={<Home />} />
        <Route path="/shop" element={<Shop />} />
        <Route path="/product/:id" element={<ProductDetail />} />
        <Route path="/track" element={<OrderTracking />} />
        <Route path="/login" element={<LoginPage />} />

        {/* Admin Routes */}
        <Route path="/admin" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
        <Route path="/admin/products" element={<AdminRoute><AdminProducts /></AdminRoute>} />
        <Route path="/admin/orders" element={<AdminRoute><AdminOrders /></AdminRoute>} />
        <Route path="/admin/hero" element={<AdminRoute><AdminHeroSlides /></AdminRoute>} />
        <Route path="/admin/users" element={<AdminRoute superOnly><AdminUsers /></AdminRoute>} />

        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <CartProvider>
          <BrowserRouter>
            <div className="min-h-screen bg-kin-50 dark:bg-gray-950 text-gray-900 dark:text-gray-100 font-body transition-colors duration-300">
              <AppRoutes />
              <Toaster
                position="top-right"
                toastOptions={{
                  className: 'dark:bg-gray-800 dark:text-white',
                  duration: 3000,
                }}
              />
            </div>
          </BrowserRouter>
        </CartProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
