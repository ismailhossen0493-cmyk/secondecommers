// frontend/src/pages/customer/ProductDetail.jsx
import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { ShoppingBag, Clock, Check, ChevronLeft, Loader2 } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import api from '../../utils/api';
import toast from 'react-hot-toast';

export default function ProductDetail() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedColor, setSelectedColor] = useState(null);
  const [selectedSize, setSelectedSize] = useState('');
  const [mainImg, setMainImg] = useState('');
  const [added, setAdded] = useState(false);
  const { addItem } = useCart();

  useEffect(() => {
    api.get(`/products/${id}`).then(r => {
      const p = r.data.data.product;
      setProduct(p);
      setMainImg(p.images?.[0] || p.colors?.[0]?.images?.[0] || '');
      if (p.colors?.length) setSelectedColor(p.colors[0]);
      if (p.sizes?.length) setSelectedSize(p.sizes.find(s => s.stock > 0)?.size || '');
    }).catch(() => toast.error('Product not found'))
    .finally(() => setLoading(false));
  }, [id]);

  const handleAddToCart = () => {
    if (!selectedSize) return toast.error('Please select a size');
    addItem(product, selectedSize, selectedColor?.name, selectedColor?.hex);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
    toast.success('Added to cart!');
  };

  if (loading) return <div className="flex justify-center py-24"><Loader2 className="animate-spin text-kin-500" size={36} /></div>;
  if (!product) return <div className="text-center py-24 text-gray-400">Product not found.</div>;

  const price = product.discountPrice || product.price;
  const allImages = [
    ...new Set([
      ...(product.images || []),
      ...(selectedColor?.images || []),
    ]),
  ];

  return (
    <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <button onClick={() => history.back()}
        className="flex items-center gap-1 text-sm text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 mb-6 transition-colors">
        <ChevronLeft size={16} /> Back
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        {/* Images */}
        <div>
          <div className="aspect-[4/5] rounded-2xl overflow-hidden bg-kin-50 dark:bg-gray-800 mb-3">
            {mainImg ? (
              <img src={mainImg} alt={product.name} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-300">No image</div>
            )}
          </div>
          {allImages.length > 1 && (
            <div className="flex gap-2 overflow-x-auto">
              {allImages.map((img, i) => (
                <button key={i} onClick={() => setMainImg(img)}
                  className={`flex-shrink-0 w-16 h-16 rounded-xl overflow-hidden border-2 transition-all ${mainImg === img ? 'border-kin-500' : 'border-transparent hover:border-kin-300'}`}>
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Details */}
        <div className="space-y-5">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs font-mono uppercase tracking-widest text-kin-500 capitalize">{product.category}</span>
              {product.isPreOrder && (
                <span className="flex items-center gap-1 px-2.5 py-1 bg-kin-100 dark:bg-kin-900/40 text-kin-700 dark:text-kin-400 text-xs font-bold rounded-full">
                  <Clock size={10} /> Pre-Order
                </span>
              )}
            </div>
            <h1 className="font-display text-3xl font-bold text-gray-900 dark:text-gray-100">{product.name}</h1>
          </div>

          <div className="flex items-baseline gap-3">
            <span className="text-3xl font-bold text-gray-900 dark:text-gray-100">৳{price.toLocaleString('en-BD')}</span>
            {product.discountPrice && (
              <span className="text-lg text-gray-400 line-through">৳{product.price.toLocaleString('en-BD')}</span>
            )}
          </div>

          <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">{product.description}</p>

          {/* Color Selector */}
          {product.colors?.length > 0 && (
            <div>
              <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Color: <span className="font-normal text-gray-500">{selectedColor?.name}</span>
              </p>
              <div className="flex gap-2 flex-wrap">
                {product.colors.map(c => (
                  <button key={c.hex}
                    onClick={() => { setSelectedColor(c); if (c.images?.[0]) setMainImg(c.images[0]); }}
                    title={c.name}
                    className={`w-9 h-9 rounded-full border-4 transition-all hover:scale-110 ${selectedColor?.hex === c.hex ? 'border-gray-800 dark:border-white scale-110' : 'border-white dark:border-gray-700 shadow-md'}`}
                    style={{ backgroundColor: c.hex }}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Size Selector */}
          {product.sizes?.length > 0 && (
            <div>
              <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Size: <span className="font-normal text-gray-500">{selectedSize}</span>
              </p>
              <div className="flex flex-wrap gap-2">
                {product.sizes.map(s => (
                  <button key={s.size}
                    onClick={() => s.stock > 0 && setSelectedSize(s.size)}
                    disabled={s.stock === 0}
                    className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all border-2 ${
                      selectedSize === s.size
                        ? 'border-kin-700 bg-kin-700 text-white'
                        : s.stock === 0
                          ? 'border-gray-100 dark:border-gray-800 text-gray-300 dark:text-gray-600 cursor-not-allowed line-through'
                          : 'border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:border-kin-400 hover:text-kin-600'
                    }`}>
                    {s.size}
                    {s.stock <= 3 && s.stock > 0 && (
                      <span className="ml-1 text-[10px] text-red-400">({s.stock} left)</span>
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}

          {product.isPreOrder && (
            <div className="p-3 bg-kin-50 dark:bg-kin-900/20 border border-kin-200 dark:border-kin-800 rounded-xl text-sm text-kin-700 dark:text-kin-400">
              📦 {product.preOrderNote}
            </div>
          )}

          <button
            onClick={handleAddToCart}
            disabled={product.totalStock === 0 && !product.isPreOrder}
            className={`w-full flex items-center justify-center gap-3 py-4 rounded-2xl font-bold text-base transition-all shadow-lg ${
              added
                ? 'bg-green-600 text-white shadow-green-200/50'
                : product.totalStock === 0 && !product.isPreOrder
                  ? 'bg-gray-200 dark:bg-gray-800 text-gray-400 cursor-not-allowed'
                  : 'bg-kin-700 hover:bg-kin-800 text-white shadow-kin-200/50 dark:shadow-none hover:scale-[1.01]'
            }`}>
            {added ? <Check size={20} /> : <ShoppingBag size={20} />}
            {added ? 'Added!' : product.totalStock === 0 && !product.isPreOrder ? 'Sold Out' : product.isPreOrder ? 'Pre-Order Now' : 'Add to Cart'}
          </button>
        </div>
      </div>
    </main>
  );
}
