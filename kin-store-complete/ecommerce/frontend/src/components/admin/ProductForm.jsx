// frontend/src/components/admin/ProductForm.jsx
import { useState } from 'react';
import { Plus, Trash2, Loader2, Pipette } from 'lucide-react';
import { useColorDropper } from '../../hooks/useColorDropper';
import api from '../../utils/api';
import toast from 'react-hot-toast';

const SIZES = ['XS', 'S', 'M', 'L', 'XL', '2XL', '3XL', '4XL', '5XL',
               '36','37','38','39','40','41','42','43','44','45', 'FREE SIZE', 'ONE SIZE'];
const CATEGORIES = ['shirts','pants','dresses','jackets','shoes','accessories','bags','activewear','other'];

const defaultForm = {
  name: '', description: '', price: '', discountPrice: '',
  category: 'shirts', colors: [], sizes: [], images: [''],
  isPreOrder: false, preOrderNote: 'Ships in 7–14 business days',
  isFeatured: false, isActive: true,
};

export default function ProductForm({ product, onSaved, onCancel }) {
  const editing = !!product;
  const [form, setForm] = useState(editing ? {
    ...product,
    price: String(product.price),
    discountPrice: String(product.discountPrice || ''),
    images: product.images?.length ? product.images : [''],
    colors: product.colors || [],
    sizes: product.sizes || [],
  } : { ...defaultForm });
  const [loading, setLoading] = useState(false);

  // Color dropper
  const { pickColor, supported: dropperSupported, picking } = useColorDropper();
  const [colorDraft, setColorDraft] = useState({ name: '', hex: '#000000' });

  const handle = (e) => {
    const { name, value, type, checked } = e.target;
    setForm(f => ({ ...f, [name]: type === 'checkbox' ? checked : value }));
  };

  // Colors
  const pickColorForDraft = async () => {
    const hex = await pickColor();
    if (hex) setColorDraft(d => ({ ...d, hex }));
  };

  const addColor = () => {
    if (!colorDraft.name || !colorDraft.hex) return;
    setForm(f => ({ ...f, colors: [...f.colors, { ...colorDraft, images: [], stock: 0 }] }));
    setColorDraft({ name: '', hex: '#000000' });
  };

  const removeColor = (i) => setForm(f => ({ ...f, colors: f.colors.filter((_, idx) => idx !== i) }));

  // Sizes
  const toggleSize = (size) => {
    setForm(f => {
      const exists = f.sizes.find(s => s.size === size);
      if (exists) return { ...f, sizes: f.sizes.filter(s => s.size !== size) };
      return { ...f, sizes: [...f.sizes, { size, stock: 0 }] };
    });
  };

  const updateSizeStock = (size, stock) => {
    setForm(f => ({ ...f, sizes: f.sizes.map(s => s.size === size ? { ...s, stock: Number(stock) } : s) }));
  };

  // Images
  const updateImage = (i, val) => setForm(f => { const imgs = [...f.images]; imgs[i] = val; return { ...f, images: imgs }; });
  const addImageField = () => setForm(f => ({ ...f, images: [...f.images, ''] }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = {
        ...form,
        price: Number(form.price),
        discountPrice: form.discountPrice ? Number(form.discountPrice) : undefined,
        images: form.images.filter(Boolean),
      };

      if (editing) {
        await api.patch(`/products/${product._id}`, payload);
        toast.success('Product updated!');
      } else {
        await api.post('/products', payload);
        toast.success('Product created!');
      }
      if (onSaved) onSaved();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Save failed');
    } finally {
      setLoading(false);
    }
  };

  const inputClass = "w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-kin-500";
  const labelClass = "block text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider mb-1";

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <h2 className="font-display text-xl font-bold">{editing ? 'Edit Product' : 'New Product'}</h2>

      {/* Basic Info */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="sm:col-span-2">
          <label className={labelClass}>Product Name *</label>
          <input name="name" value={form.name} onChange={handle} required placeholder="Classic Linen Shirt" className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>Price (৳) *</label>
          <input name="price" type="number" min="0" value={form.price} onChange={handle} required className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>Discount Price (৳)</label>
          <input name="discountPrice" type="number" min="0" value={form.discountPrice} onChange={handle} placeholder="Optional" className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>Category *</label>
          <select name="category" value={form.category} onChange={handle} className={inputClass}>
            {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <div className="sm:col-span-2">
          <label className={labelClass}>Description *</label>
          <textarea name="description" value={form.description} onChange={handle} required rows={3} className={inputClass + ' resize-none'} />
        </div>
      </div>

      {/* Colors with EyeDropper */}
      <div className="border border-gray-100 dark:border-gray-800 rounded-xl p-4">
        <h3 className="text-sm font-bold text-gray-700 dark:text-gray-300 mb-3">Color Variants</h3>

        {form.colors.map((c, i) => (
          <div key={i} className="flex items-center gap-2 mb-2">
            <div className="w-7 h-7 rounded-full border-2 border-white shadow-md flex-shrink-0" style={{ backgroundColor: c.hex }} />
            <span className="text-sm flex-1 text-gray-700 dark:text-gray-300">{c.name}</span>
            <span className="font-mono text-xs text-gray-400">{c.hex}</span>
            <button type="button" onClick={() => removeColor(i)} className="text-red-400 hover:text-red-600 p-1">
              <Trash2 size={13} />
            </button>
          </div>
        ))}

        <div className="flex items-center gap-2 mt-3 flex-wrap">
          <input
            placeholder="Color name (e.g. Midnight Black)"
            value={colorDraft.name}
            onChange={e => setColorDraft(d => ({ ...d, name: e.target.value }))}
            className={inputClass + ' flex-1 min-w-[140px]'}
          />

          {/* Color swatch + manual input */}
          <div className="relative flex items-center gap-1">
            <input
              type="color"
              value={colorDraft.hex}
              onChange={e => setColorDraft(d => ({ ...d, hex: e.target.value }))}
              className="w-9 h-9 rounded-lg border border-gray-200 cursor-pointer"
            />
            {dropperSupported && (
              <button
                type="button"
                onClick={pickColorForDraft}
                disabled={picking}
                title="Pick color from screen"
                className="p-2 rounded-lg bg-kin-100 dark:bg-gray-700 text-kin-700 dark:text-kin-400 hover:bg-kin-200 transition-all disabled:opacity-50"
              >
                <Pipette size={14} className={picking ? 'animate-spin-slow' : ''} />
              </button>
            )}
            <span className="font-mono text-xs text-gray-400 w-16">{colorDraft.hex}</span>
          </div>

          <button type="button" onClick={addColor}
            className="flex items-center gap-1 px-3 py-2 bg-kin-700 text-white rounded-lg text-xs font-semibold hover:bg-kin-800 transition-all">
            <Plus size={12} /> Add
          </button>
        </div>
        {!dropperSupported && (
          <p className="text-xs text-amber-500 mt-2">EyeDropper requires Chrome 95+. Use the color picker instead.</p>
        )}
      </div>

      {/* Sizes */}
      <div className="border border-gray-100 dark:border-gray-800 rounded-xl p-4">
        <h3 className="text-sm font-bold text-gray-700 dark:text-gray-300 mb-3">Sizes & Stock</h3>
        <div className="flex flex-wrap gap-2 mb-3">
          {SIZES.map(size => {
            const active = form.sizes.some(s => s.size === size);
            return (
              <button key={size} type="button" onClick={() => toggleSize(size)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  active
                    ? 'bg-kin-700 text-white shadow-md'
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-kin-100 dark:hover:bg-gray-700'
                }`}>
                {size}
              </button>
            );
          })}
        </div>
        {form.sizes.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {form.sizes.map(s => (
              <div key={s.size} className="flex items-center gap-2 bg-kin-50 dark:bg-gray-800 rounded-lg px-3 py-2">
                <span className="text-xs font-bold text-kin-700 dark:text-kin-400 w-12">{s.size}</span>
                <input
                  type="number"
                  min="0"
                  value={s.stock}
                  onChange={e => updateSizeStock(s.size, e.target.value)}
                  className="w-full text-xs bg-transparent border-b border-gray-200 dark:border-gray-700 focus:outline-none focus:border-kin-500 text-right"
                  placeholder="Qty"
                />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Images */}
      <div>
        <label className={labelClass}>Product Images (URLs)</label>
        {form.images.map((img, i) => (
          <input key={i} value={img} onChange={e => updateImage(i, e.target.value)}
            placeholder={`Image ${i + 1} URL`} className={inputClass + ' mb-2'} />
        ))}
        <button type="button" onClick={addImageField}
          className="text-xs text-kin-600 hover:text-kin-800 flex items-center gap-1 mt-1">
          <Plus size={12} /> Add image
        </button>
      </div>

      {/* Flags */}
      <div className="flex flex-wrap gap-4">
        {[
          { name: 'isPreOrder', label: 'Pre-Order' },
          { name: 'isFeatured', label: 'Featured' },
          { name: 'isActive', label: 'Active' },
        ].map(({ name, label }) => (
          <label key={name} className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" name={name} checked={form[name]} onChange={handle}
              className="w-4 h-4 accent-kin-600 rounded" />
            <span className="text-sm text-gray-700 dark:text-gray-300">{label}</span>
          </label>
        ))}
      </div>

      {form.isPreOrder && (
        <div>
          <label className={labelClass}>Pre-Order Note</label>
          <input name="preOrderNote" value={form.preOrderNote} onChange={handle} className={inputClass} />
        </div>
      )}

      <div className="flex gap-3 pt-2">
        <button type="submit" disabled={loading}
          className="flex-1 flex items-center justify-center gap-2 py-3 bg-kin-700 hover:bg-kin-800 text-white font-semibold rounded-xl transition-all disabled:opacity-50">
          {loading ? <Loader2 size={16} className="animate-spin" /> : null}
          {loading ? 'Saving…' : editing ? 'Update Product' : 'Create Product'}
        </button>
        {onCancel && (
          <button type="button" onClick={onCancel}
            className="px-6 py-3 rounded-xl border border-gray-200 dark:border-gray-700 text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-800 transition-all">
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}
