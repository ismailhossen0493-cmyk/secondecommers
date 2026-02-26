// frontend/src/context/CartContext.jsx
import { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const [items, setItems] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('kin_cart') || '[]');
    } catch { return []; }
  });

  useEffect(() => {
    localStorage.setItem('kin_cart', JSON.stringify(items));
  }, [items]);

  const addItem = (product, size, color, colorHex, quantity = 1) => {
    setItems(prev => {
      const key = `${product._id}-${size}-${colorHex || ''}`;
      const existing = prev.find(i => i.key === key);
      if (existing) {
        return prev.map(i => i.key === key ? { ...i, quantity: i.quantity + quantity } : i);
      }
      return [...prev, {
        key,
        productId: product._id,
        productName: product.name,
        price: product.discountPrice || product.price,
        image: product.images?.[0] || product.colors?.find(c => c.hex === colorHex)?.images?.[0],
        size, color, colorHex, quantity,
        isPreOrder: product.isPreOrder,
      }];
    });
  };

  const updateQuantity = (key, quantity) => {
    if (quantity < 1) return removeItem(key);
    setItems(prev => prev.map(i => i.key === key ? { ...i, quantity } : i));
  };

  const removeItem = (key) => setItems(prev => prev.filter(i => i.key !== key));

  const clearCart = () => setItems([]);

  const total = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const itemCount = items.reduce((sum, i) => sum + i.quantity, 0);

  return (
    <CartContext.Provider value={{ items, total, itemCount, addItem, updateQuantity, removeItem, clearCart }}>
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => useContext(CartContext);
