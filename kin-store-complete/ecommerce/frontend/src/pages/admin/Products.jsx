// frontend/src/pages/admin/Products.jsx
import { useState, useEffect } from 'react';
import { Plus, Edit3, Trash2, ToggleLeft, ToggleRight, Loader2 } from 'lucide-react';
import ProductForm from '../../components/admin/ProductForm';
import api from '../../utils/api';
import toast from 'react-hot-toast';

export default function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState('list'); // 'list' | 'new' | product
  const [editProduct, setEditProduct] = useState(null);

  const fetch = async () => {
    setLoading(true);
    try {
      const res = await api.get('/products/admin/all');
      setProducts(res.data.data.products);
    } catch { toast.error('Failed to load products'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetch(); }, []);

  const deleteProduct = async (id) => {
    if (!confirm('Deactivate this product?')) return;
    try {
      await api.delete(`/products/${id}`);
      toast.success('Product deactivated');
      fetch();
    } catch { toast.error('Failed'); }
  };

  if (view === 'new' || editProduct) {
    return (
      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <ProductForm
          product={editProduct || null}
          onSaved={() => { fetch(); setView('list'); setEditProduct(null); }}
          onCancel={() => { setView('list'); setEditProduct(null); }}
        />
      </main>
    );
  }

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-display text-2xl font-bold">Products ({products.length})</h1>
        <button onClick={() => setView('new')}
          className="flex items-center gap-2 px-4 py-2 bg-kin-700 text-white text-sm font-semibold rounded-xl hover:bg-kin-800 transition-all">
          <Plus size={15} /> New Product
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-16"><Loader2 className="animate-spin text-kin-500" size={36} /></div>
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-900/30">
                {['Product', 'Category', 'Price', 'Stock', 'Status', ''].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 dark:divide-gray-700/50">
              {products.map(p => (
                <tr key={p._id} className={`hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors ${!p.isActive ? 'opacity-50' : ''}`}>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-gray-100 dark:bg-gray-700 overflow-hidden flex-shrink-0">
                        {p.images?.[0] && <img src={p.images[0]} alt={p.name} className="w-full h-full object-cover" />}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">{p.name}</p>
                        {p.isPreOrder && (
                          <span className="text-[10px] bg-kin-100 dark:bg-kin-900/40 text-kin-700 dark:text-kin-400 px-1.5 py-0.5 rounded-full font-bold">Pre-Order</span>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-500 capitalize">{p.category}</td>
                  <td className="px-4 py-3">
                    <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">৳{(p.discountPrice || p.price).toLocaleString('en-BD')}</p>
                    {p.discountPrice && <p className="text-xs text-gray-400 line-through">৳{p.price.toLocaleString('en-BD')}</p>}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-sm font-semibold ${p.totalStock > 10 ? 'text-green-500' : p.totalStock > 0 ? 'text-amber-500' : 'text-red-400'}`}>
                      {p.totalStock}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-xs font-semibold ${p.isActive ? 'text-green-500' : 'text-gray-400'}`}>
                      {p.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      <button onClick={() => setEditProduct(p)}
                        className="p-1.5 rounded-lg text-kin-600 hover:bg-kin-50 dark:hover:bg-kin-900/20 transition-colors">
                        <Edit3 size={14} />
                      </button>
                      <button onClick={() => deleteProduct(p._id)}
                        className="p-1.5 rounded-lg text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {products.length === 0 && <div className="text-center py-12 text-gray-400">No products yet.</div>}
        </div>
      )}
    </main>
  );
}
