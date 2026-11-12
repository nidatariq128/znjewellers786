import React, { createContext, useContext, useEffect, useState } from 'react';
import { CartItem, Product } from '../types';

interface CartContextType {
  items: CartItem[];
  addToCart: (product: Product, quantity?: number, selectedSize?: string) => void;
  removeFromCart: (productId: string, selectedSize?: string) => void;
  updateQuantity: (productId: string, quantity: number, selectedSize?: string) => void;
  clearCart: () => void;
  totalItems: number;
  subtotal: number;
  shippingCost: number;
  freeShippingThreshold: number;
  discount: number;
  appliedPromo: string | null;
  applyPromoCode: (code: string) => { success: boolean; message: string };
  removePromoCode: () => void;
  total: number;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const FREE_SHIPPING_THRESHOLD = 5000; // ₨ 5,000 Free Delivery
const STANDARD_SHIPPING_FEE = 2000; // ₨ 2,000 insured delivery under ₨ 5,000

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem('zn_cart');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [appliedPromo, setAppliedPromo] = useState<string | null>(null);
  const [discountAmount, setDiscountAmount] = useState<number>(0);
  const [isCartOpen, setIsCartOpen] = useState<boolean>(false);

  useEffect(() => {
    try {
      localStorage.setItem('zn_cart', JSON.stringify(items));
    } catch (e) {
      console.warn('LocalStorage cart error', e);
    }
  }, [items]);

  const addToCart = (product: Product, quantity: number = 1, selectedSize?: string) => {
    setItems((prevItems) => {
      const existingIndex = prevItems.findIndex(
        (item) => item.product.id === product.id && item.selectedSize === selectedSize
      );

      if (existingIndex > -1) {
        const existingItem = prevItems[existingIndex];
        const newQty = Math.min(existingItem.quantity + quantity, product.stock);
        const updated = [...prevItems];
        updated[existingIndex] = { ...existingItem, quantity: newQty };
        return updated;
      } else {
        const initialQty = Math.min(quantity, Math.max(1, product.stock));
        return [...prevItems, { product, quantity: initialQty, selectedSize }];
      }
    });
    setIsCartOpen(true);
  };

  const removeFromCart = (productId: string, selectedSize?: string) => {
    setItems((prevItems) =>
      prevItems.filter(
        (item) => !(item.product.id === productId && item.selectedSize === selectedSize)
      )
    );
  };

  const updateQuantity = (productId: string, quantity: number, selectedSize?: string) => {
    if (quantity <= 0) {
      removeFromCart(productId, selectedSize);
      return;
    }
    setItems((prevItems) =>
      prevItems.map((item) => {
        if (item.product.id === productId && item.selectedSize === selectedSize) {
          const clampedQty = Math.min(quantity, item.product.stock);
          return { ...item, quantity: clampedQty };
        }
        return item;
      })
    );
  };

  const clearCart = () => {
    setItems([]);
    setAppliedPromo(null);
    setDiscountAmount(0);
  };

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);

  const subtotal = items.reduce((sum, item) => {
    const itemPrice = item.product.salePrice ?? item.product.price;
    return sum + itemPrice * item.quantity;
  }, 0);

  const shippingCost = subtotal >= FREE_SHIPPING_THRESHOLD || items.length === 0 ? 0 : STANDARD_SHIPPING_FEE;

  // Promo code verification
  const applyPromoCode = (code: string) => {
    const cleanCode = code.trim().toUpperCase();
    if (cleanCode === 'ZNLUXURY10') {
      const discount = Math.round(subtotal * 0.1);
      setAppliedPromo(cleanCode);
      setDiscountAmount(discount);
      return { success: true, message: 'VIP 10% privilege discount applied!' };
    } else if (cleanCode === 'WELCOMEZN') {
      const discount = 15000;
      setAppliedPromo(cleanCode);
      setDiscountAmount(discount);
      return { success: true, message: '₨ 15,000 introductory welcome voucher applied!' };
    } else if (cleanCode === 'ROYAL50K') {
      if (subtotal >= 500000) {
        setAppliedPromo(cleanCode);
        setDiscountAmount(50000);
        return { success: true, message: 'Royal Patron ₨ 50,000 discount applied!' };
      } else {
        return { success: false, message: 'ROYAL50K requires a minimum order of ₨ 500,000' };
      }
    }
    return { success: false, message: 'Invalid or expired promotional code' };
  };

  const removePromoCode = () => {
    setAppliedPromo(null);
    setDiscountAmount(0);
  };

  const total = Math.max(0, subtotal - discountAmount + shippingCost);

  return (
    <CartContext.Provider
      value={{
        items,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        totalItems,
        subtotal,
        shippingCost,
        freeShippingThreshold: FREE_SHIPPING_THRESHOLD,
        discount: discountAmount,
        appliedPromo,
        applyPromoCode,
        removePromoCode,
        total,
        isCartOpen,
        setIsCartOpen
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
