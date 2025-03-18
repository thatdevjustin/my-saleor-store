"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

export interface CartItem {
  productId: string;
  name: string;
  price: number;
  currency: string;
  quantity: number;
  thumbnail?: string;
}

interface CartContextType {
  cartItems: CartItem[];
  checkoutToken: string | null;
  addToCart: (item: CartItem) => void;
  removeFromCart: (productId: string) => void;
  clearCart: () => void;
  setCheckoutToken: (token: string | null) => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider = ({ children }: { children: React.ReactNode }) => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [checkoutToken, setCheckoutToken] = useState<string | null>(null);

  // Load from localStorage if needed
  useEffect(() => {
    const storedCart = localStorage.getItem("cart");
    const storedCheckout = localStorage.getItem("checkoutToken");
    if (storedCart) {
      setCartItems(JSON.parse(storedCart));
    }
    if (storedCheckout) {
      setCheckoutToken(storedCheckout);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(cartItems));
  }, [cartItems]);

  useEffect(() => {
    if (checkoutToken) {
      localStorage.setItem("checkoutToken", checkoutToken);
    } else {
      localStorage.removeItem("checkoutToken");
    }
  }, [checkoutToken]);

  const addToCart = (item: CartItem) => {
    setCartItems((prev) => {
      const existing = prev.find((i) => i.productId === item.productId);
      if (existing) {
        return prev.map((i) =>
          i.productId === item.productId
            ? { ...i, quantity: i.quantity + item.quantity }
            : i
        );
      }
      return [...prev, item];
    });
  };

  const removeFromCart = (productId: string) => {
    setCartItems((prev) => prev.filter((item) => item.productId !== productId));
  };

  const clearCart = () => {
    setCartItems([]);
    setCheckoutToken(null);
  };

  return (
    <CartContext.Provider
      value={{
        cartItems,
        checkoutToken,
        addToCart,
        removeFromCart,
        clearCart,
        setCheckoutToken,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = (): CartContextType => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
};
