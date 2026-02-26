// frontend/src/pages/customer/Shop.jsx
import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { ShoppingBag, X, Search, Filter, Loader2 } from 'lucide-react';
import ProductCard from '../../components/customer/ProductCard';
import CheckoutForm from '../../components/customer/CheckoutForm';
import { useCart } from '../../context/CartContext';
import api from '../../utils/api';
import toast from 'react-hot-toast';

const CATEGORIES = ['all', 'shirts', 'pants', 'dresses', 'jackets', 'shoes', 'accessories', 'bags', 'activewear'];

export default function Shop() {
  const [searchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState('all');
  const [search, setSearch] = useState('');
  const [preorderOnly, setPreorderOnly] = useState(searchParams.get('preorder') === 'true');
  const [cartOpen, setCartOpen] = useState(false);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [quickAdd, setQuickAdd] = useState(null); // product for size selection
  const [selectedSize, setSelectedSize] = useState('');

  const { items, total, itemCount, addItem, updateQuantity, removeItem, clearCart } = useCart();

  useEffect(() => {
    fetchProducts();
  }, [category, preorderOnly]);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (category !== 'all') params.set('category', category);
      if (preorderOnly) params.set('isPreOrder', 'true');
      if (search) params.set('search', search);
      const res = await api.get(`/products?${params}`);
      setProducts(res.data.data.products);
    } catch { toast.error('Failed to load products'); }
    finally { setLoading(false); }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchProducts();
  };

  const handleAddToCart = (product) => {
    if (product.sizes?.length > 0) {
      setQuickAdd(product);
      setSelectedSize(product.sizes[0]?.size || '');
    } else {
      addItem(product, 'ONE SIZE', null, null);
      toast.success('Added to cart!');
    }
  };

  const confirmAddToCart = () => {
    if (!selectedSize) return toast.error('Please select a size');
    addItem(quickAdd, selectedSize, null, null);
    setQuickAdd(null);
    toast.success('Added to cart!');
  };

  const handleCheckoutSuccess = () => {
    clearCart();
    setCheckoutOpen(false);
    setCartOpen(false);
  };

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="font-display text-3xl font-bold text-gray-900 dark:text-gray-100">Shop</h1>
          <p className="text-sm text-gray-400 mt-0.5">{products.length} products</p>
        </div>

        <div className="flex items-center gap-3">
          {/* Search */}
          <form onSubmit={handleSearch} className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search products…"
              className="pl-8 pr-4 py-2 text-sm rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-kin-500 w-48" />
          </form>

          {/* Pre-order filter */}
          <label className="flex items-center gap-1.5 text-sm cursor-pointer">
            <input type="checkbox" checked={preorderOnly} onChange={e => setPreorderOnly(e.target.checked)}
              className="w-3.5 h-3.5 accent-kin-600" />
            <span className="text-gray-600 dark:text-gray-400">Pre-order</span>
          </label>

          {/* Cart Button */}
          <button onClick={() => setCartOpen(true)}
            className="relative flex items-center gap-2 px-4 py-2 bg-kin-700 text-white text-sm font-semibold rounded-xl hover:bg-kin-800 transition-all">
            <ShoppingBag size={15} />
            Cart
            {itemCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 h-5 w-5 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center">
                {itemCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Category Filter */}
      <div className="flex gap-2 overflow-x-auto pb-2 mb-6 scrollbar-hide">
        {CATEGORIES.map(cat => (
          <button key={cat} onClick={() => setCategory(cat)}
            className={`flex-shrink-0 px-4 py-1.5 rounded-full text-sm font-medium transition-all capitalize ${
              category === cat
                ? 'bg-kin-700 text-white shadow-md'
                : 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:border-kin-300 hover:text-kin-600'
            }`}>
            {cat === 'all' ? 'All Items' : cat}
          </button>
        ))}
      </div>

      {/* Products Grid */}
      {loading ? (
        <div className="flex justify-center py-16"><Loader2 className="animate-spin text-kin-500" size={36} /></div>
      ) : products.length === 0 ? (
        <div className="text-center py-16 text-gray-400">No products found.</div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {products.map(p => (
            <ProductCard key={p._id} product={p} onAddToCart={handleAddToCart} />
          ))}
        </div>
      )}

      {/* Quick Size Modal */}
      {quickAdd && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-end sm:items-center justify-center p-4">
          <div className="w-full max-w-sm bg-white dark:bg-gray-900 rounded-2xl p-6 animate-slide-in-up">
            <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-4">Select Size — {quickAdd.name}</h3>
            <div className="flex flex-wrap gap-2 mb-5">
              {quickAdd.sizes.map(s => (
                <button key={s.size} onClick={() => setSelectedSize(s.size)}
                  disabled={s.stock === 0}
                  className={`px-3 py-1.5 rounded-lg text-sm font-semibold transition-all ${
                    selectedSize === s.size ? 'bg-kin-700 text-white' :
                    s.stock === 0 ? 'bg-gray-100 dark:bg-gray-800 text-gray-300 line-through cursor-not-allowed' :
                    'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-kin-100 dark:hover:bg-gray-700'
                  }`}>
                  {s.size}
                </button>
              ))}
            </div>
            <div className="flex gap-3">
              <button onClick={confirmAddToCart}
                className="flex-1 py-2.5 bg-kin-700 text-white text-sm font-semibold rounded-xl hover:bg-kin-800 transition-all">
                Add to Cart
              </button>
              <button onClick={() => setQuickAdd(null)}
                className="px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-800">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Cart Drawer */}
      {cartOpen && (
        <div className="fixed inset-0 z-50 flex">
          <div className="flex-1 bg-black/40" onClick={() => setCartOpen(false)} />
          <div className="w-full max-w-sm bg-white dark:bg-gray-900 shadow-2xl flex flex-col animate-slide-in-up overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-gray-800">
              <h2 className="font-display text-lg font-bold">Cart ({itemCount})</h2>
              <button onClick={() => setCartOpen(false)}><X size={18} /></button>
            </div>

            {items.length === 0 ? (
              <div className="flex-1 flex items-center justify-center text-gray-400">Your cart is empty</div>
            ) : (
              <>
                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                  {items.map(item => (
                    <div key={item.key} className="flex gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-xl">
                      {item.image && <img src={item.image} alt={item.productName} className="w-14 h-14 rounded-lg object-cover flex-shrink-0" />}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-gray-800 dark:text-gray-200 line-clamp-1">{item.productName}</p>
                        <p className="text-xs text-gray-400">Size: {item.size}</p>
                        <div className="flex items-center justify-between mt-2">
                          <div className="flex items-center gap-1.5">
                            <button onClick={() => updateQuantity(item.key, item.quantity - 1)}
                              className="w-6 h-6 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-xs font-bold hover:bg-kin-100 dark:hover:bg-gray-600 transition-colors">−</button>
                            <span className="text-sm font-semibold w-4 text-center">{item.quantity}</span>
                            <button onClick={() => updateQuantity(item.key, item.quantity + 1)}
                              className="w-6 h-6 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-xs font-bold hover:bg-kin-100 dark:hover:bg-gray-600 transition-colors">+</button>
                          </div>
                          <span className="text-sm font-bold text-kin-700 dark:text-kin-400">৳{(item.price * item.quantity).toLocaleString('en-BD')}</span>
                        </div>
                      </div>
                      <button onClick={() => removeItem(item.key)} className="text-gray-300 hover:text-red-400 p-1 flex-shrink-0">
                        <X size={14} />
                      </button>
                    </div>
                  ))}
                </div>

                <div className="p-4 border-t border-gray-100 dark:border-gray-800">
                  <div className="flex justify-between font-bold text-base mb-4">
                    <span>Subtotal</span>
                    <span className="text-kin-700 dark:text-kin-400">৳{total.toLocaleString('en-BD')}</span>
                  </div>
                  <button
                    onClick={() => { setCartOpen(false); setCheckoutOpen(true); }}
                    className="w-full py-3 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-xl text-sm transition-all flex items-center justify-center gap-2">
                    <ShoppingBag size={16} /> Proceed to Checkout
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Checkout Modal */}
      {checkoutOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-white dark:bg-gray-900 rounded-2xl shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-gray-800">
              <button onClick={() => setCheckoutOpen(false)}><X size={18} /></button>
            </div>
            <div className="p-6">
              <CheckoutForm items={items} total={total} onSuccess={handleCheckoutSuccess} />
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
