// frontend/src/components/customer/ProductCard.jsx
import { Link } from 'react-router-dom';
import { ShoppingBag, Clock } from 'lucide-react';

export default function ProductCard({ product, onAddToCart }) {
  const price = product.discountPrice || product.price;
  const hasDiscount = product.discountPrice && product.discountPrice < product.price;
  const mainImage = product.images?.[0] || product.colors?.[0]?.images?.[0] || 'https://via.placeholder.com/400x500?text=KIN';
  const inStock = product.totalStock > 0 || product.isPreOrder;

  return (
    <div className="group relative bg-white dark:bg-gray-900 rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border border-gray-100 dark:border-gray-800">

      {/* Image */}
      <Link to={`/product/${product._id}`} className="block relative aspect-[3/4] overflow-hidden bg-kin-50 dark:bg-gray-800">
        <img
          src={mainImage}
          alt={product.name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          loading="lazy"
        />

        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5">
          {product.isPreOrder && (
            <span className="flex items-center gap-1 px-2.5 py-1 bg-kin-700 text-white text-[10px] font-bold uppercase tracking-wider rounded-full">
              <Clock size={9} /> Pre-Order
            </span>
          )}
          {hasDiscount && (
            <span className="px-2.5 py-1 bg-red-500 text-white text-[10px] font-bold uppercase tracking-wider rounded-full">
              Sale
            </span>
          )}
          {!inStock && !product.isPreOrder && (
            <span className="px-2.5 py-1 bg-gray-800/80 text-white text-[10px] font-bold uppercase tracking-wider rounded-full">
              Sold Out
            </span>
          )}
        </div>

        {/* Color swatches */}
        {product.colors?.length > 0 && (
          <div className="absolute bottom-3 left-3 flex gap-1">
            {product.colors.slice(0, 5).map(c => (
              <div key={c.hex}
                className="w-4 h-4 rounded-full border-2 border-white shadow"
                style={{ backgroundColor: c.hex }}
                title={c.name}
              />
            ))}
            {product.colors.length > 5 && (
              <div className="w-4 h-4 rounded-full bg-gray-200 dark:bg-gray-700 border-2 border-white text-[7px] flex items-center justify-center font-bold text-gray-600">
                +{product.colors.length - 5}
              </div>
            )}
          </div>
        )}
      </Link>

      {/* Info */}
      <div className="p-4">
        <Link to={`/product/${product._id}`}>
          <h3 className="font-display text-base font-semibold text-gray-800 dark:text-gray-100 line-clamp-1 hover:text-kin-600 dark:hover:text-kin-400 transition-colors">
            {product.name}
          </h3>
        </Link>
        <p className="text-xs text-gray-400 dark:text-gray-500 capitalize mt-0.5">{product.category}</p>

        <div className="flex items-center justify-between mt-3">
          <div className="flex items-baseline gap-1.5">
            <span className="font-semibold text-lg text-gray-900 dark:text-gray-100">৳{price.toLocaleString('en-BD')}</span>
            {hasDiscount && (
              <span className="text-xs text-gray-400 line-through">৳{product.price.toLocaleString('en-BD')}</span>
            )}
          </div>

          {inStock && onAddToCart && (
            <button
              onClick={() => onAddToCart(product)}
              className="p-2 rounded-xl bg-kin-700 text-white hover:bg-kin-800 transition-all shadow-md shadow-kin-200/50 dark:shadow-none hover:scale-105"
            >
              <ShoppingBag size={15} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
