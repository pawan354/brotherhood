import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { products } from '../data/products';

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const [cart, setCart] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('brotherhood_cart')) || [];
    } catch { return []; }
  });
  const [isOpen, setIsOpen] = useState(false);

  // Persist cart to localStorage
  useEffect(() => {
    localStorage.setItem('brotherhood_cart', JSON.stringify(cart));
  }, [cart]);

  const addToCart = useCallback((productId, size = 'M') => {
    const cartItemId = `${productId}-${size}`;
    setCart(prev => {
      const existing = prev.find(i => i.cartItemId === cartItemId);
      if (existing) return prev.map(i => i.cartItemId === cartItemId ? { ...i, quantity: i.quantity + 1 } : i);
      return [...prev, { cartItemId, id: productId, size, quantity: 1 }];
    });
    setIsOpen(true);
  }, []);

  const updateQty = useCallback((cartItemId, action) => {
    setCart(prev => prev
      .map(i => i.cartItemId === cartItemId
        ? { ...i, quantity: action === 'increase' ? i.quantity + 1 : Math.max(1, i.quantity - 1) }
        : i
      )
      .filter(i => !(i.cartItemId === cartItemId && action === 'decrease' && i.quantity === 1))
    );
  }, []);

  const removeFromCart = useCallback((cartItemId) => {
    setCart(prev => prev.filter(i => i.cartItemId !== cartItemId));
  }, []);

  const clearCart = useCallback(() => setCart([]), []);

  const cartCount = cart.reduce((sum, i) => sum + i.quantity, 0);

  const cartTotal = cart.reduce((sum, item) => {
    const p = products.find(p => p.id === item.id);
    return sum + (p ? p.price * item.quantity : 0);
  }, 0);

  const cartItems = cart.map(item => ({
    ...item,
    product: products.find(p => p.id === item.id),
  })).filter(i => i.product);

  return (
    <CartContext.Provider value={{ cart, cartItems, cartCount, cartTotal, isOpen, setIsOpen, addToCart, updateQty, removeFromCart, clearCart }}>
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => useContext(CartContext);
