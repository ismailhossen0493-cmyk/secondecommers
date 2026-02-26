// frontend/src/pages/customer/Home.jsx
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Package, Shield, Clock } from 'lucide-react';
import HeroSlider from '../../components/customer/HeroSlider';
import ProductCard from '../../components/customer/ProductCard';
import api from '../../utils/api';

export default function Home() {
  const [featured, setFeatured] = useState([]);
  const [preorders, setPreorders] = useState([]);

  useEffect(() => {
    api.get('/products?isFeatured=true&limit=4').then(r => setFeatured(r.data.data.products)).catch(() => {});
    api.get('/products?isPreOrder=true&limit=4').then(r => setPreorders(r.data.data.products)).catch(() => {});
  }, []);

  const features = [
    { icon: Package, title: 'Free Delivery', desc: 'On orders over ৳2,000' },
    { icon: Shield, title: 'Authentic Quality', desc: 'Every item is quality checked' },
    { icon: Clock, title: 'Pre-Order Available', desc: 'Reserve exclusive items' },
  ];

  return (
    <main>
      <HeroSlider />

      {/* Feature Badges */}
      <section className="bg-kin-700 dark:bg-kin-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {features.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="flex items-center gap-3">
                <div className="p-2 bg-white/10 rounded-xl">
                  <Icon size={18} />
                </div>
                <div>
                  <p className="text-sm font-bold">{title}</p>
                  <p className="text-xs opacity-70">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      {featured.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="flex items-center justify-between mb-8">
            <div>
              <p className="text-xs font-mono uppercase tracking-widest text-kin-500 dark:text-kin-400 mb-1">Curated for you</p>
              <h2 className="font-display text-3xl font-bold text-gray-900 dark:text-gray-100">Featured Picks</h2>
            </div>
            <Link to="/shop" className="flex items-center gap-1.5 text-sm font-semibold text-kin-700 dark:text-kin-400 hover:text-kin-800 transition-colors">
              View all <ArrowRight size={14} />
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {featured.map(p => <ProductCard key={p._id} product={p} />)}
          </div>
        </section>
      )}

      {/* Pre-orders */}
      {preorders.length > 0 && (
        <section className="bg-kin-50 dark:bg-gray-900/60 py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between mb-8">
              <div>
                <p className="text-xs font-mono uppercase tracking-widest text-kin-500 dark:text-kin-400 mb-1">Reserve yours</p>
                <h2 className="font-display text-3xl font-bold text-gray-900 dark:text-gray-100">Pre-Order Items</h2>
              </div>
              <Link to="/shop?preorder=true" className="flex items-center gap-1.5 text-sm font-semibold text-kin-700 dark:text-kin-400 hover:text-kin-800 transition-colors">
                View all <ArrowRight size={14} />
              </Link>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
              {preorders.map(p => <ProductCard key={p._id} product={p} />)}
            </div>
          </div>
        </section>
      )}

      {/* CTA Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="relative bg-kin-900 dark:bg-kin-950 rounded-3xl overflow-hidden px-8 py-14 text-center">
          <div className="absolute inset-0 opacity-10 bg-gradient-to-br from-kin-400 to-kin-900" />
          <div className="relative">
            <h2 className="font-display text-4xl font-bold text-white mb-3">
              Order via WhatsApp
            </h2>
            <p className="text-kin-300 mb-8 max-w-md mx-auto">
              Simple, fast checkout. Add items to cart and place your order directly on WhatsApp.
            </p>
            <Link to="/shop"
              className="inline-flex items-center gap-2 px-8 py-3.5 bg-kin-400 hover:bg-kin-300 text-kin-900 font-bold rounded-full transition-all hover:scale-105">
              Start Shopping <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
