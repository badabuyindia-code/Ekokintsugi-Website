import React, { createContext, useContext, useState, useEffect } from "react";
import type { CatalogProduct } from "./productCatalog";
import { useAuth } from "./AuthContext";

export interface CartItem {
  product: CatalogProduct;
  quantity: number;
  selectedSize: string;
}

interface CartContextType {
  cartItems: CartItem[];
  isCartOpen: boolean;
  setCartOpen: (open: boolean) => void;
  addToCart: (product: CatalogProduct, quantity?: number, selectedSize?: string) => void;
  removeFromCart: (productId: string, size: string) => void;
  updateQuantity: (productId: string, size: string, quantity: number) => void;
  clearCart: () => void;
  totalCo2Saved: number;
  totalWasteReclaimed: number;
  totalItems: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [cartItems, setCartItems] = useState<CartItem[]>(() => {
    const saved = localStorage.getItem("ekokintsugi_cart");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return [];
      }
    }
    return [];
  });
  const [isCartOpen, _setCartOpen] = useState(false);

  const setCartOpen = (open: boolean) => {
    if (!user && open) return;
    _setCartOpen(open);
  };

  useEffect(() => {
    if (!user) {
      setCartItems([]);
      _setCartOpen(false);
      localStorage.removeItem("ekokintsugi_cart");
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      localStorage.setItem("ekokintsugi_cart", JSON.stringify(cartItems));
    }
  }, [cartItems, user]);

  const addToCart = (product: CatalogProduct, quantity = 1, selectedSize = "One Size") => {
    if (!user) return;
    setCartItems((prev) => {
      const existing = prev.find(
        (item) => item.product.id === product.id && item.selectedSize === selectedSize
      );
      if (existing) {
        return prev.map((item) =>
          item.product.id === product.id && item.selectedSize === selectedSize
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }
      return [...prev, { product, quantity, selectedSize }];
    });
    setCartOpen(true); // Auto-open cart drawer on add
  };

  const removeFromCart = (productId: string, size: string) => {
    setCartItems((prev) =>
      prev.filter((item) => !(item.product.id === productId && item.selectedSize === size))
    );
  };

  const updateQuantity = (productId: string, size: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId, size);
      return;
    }
    setCartItems((prev) =>
      prev.map((item) =>
        item.product.id === productId && item.selectedSize === size
          ? { ...item, quantity }
          : item
      )
    );
  };

  const clearCart = () => {
    setCartItems([]);
  };

  const totalCo2Saved = cartItems.reduce((acc, item) => {
    const co2 = typeof item.product.co2_factor === "string" 
      ? parseFloat(item.product.co2_factor) 
      : (item.product.co2_factor ?? 0);
    return acc + co2 * item.quantity;
  }, 0);

  const totalWasteReclaimed = cartItems.reduce((acc, item) => {
    const waste = typeof item.product.waste_factor === "string" 
      ? parseFloat(item.product.waste_factor) 
      : (item.product.waste_factor ?? 0);
    return acc + waste * item.quantity;
  }, 0);

  const totalItems = cartItems.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        cartItems,
        isCartOpen,
        setCartOpen,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        totalCo2Saved,
        totalWasteReclaimed,
        totalItems,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
};
