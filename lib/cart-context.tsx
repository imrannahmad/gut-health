"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { CartItem, CartContextType } from "@/types/cart";
import { PackOption } from "@/types/product";
import { PRODUCT_CONFIG } from "./product-config";

const CartContext = createContext<CartContextType | undefined>(undefined);

const STORAGE_KEY = "gutglow_cart_v1";

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isHydrated, setIsHydrated] = useState(false);

  // Load cart from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          setItems(parsed);
        }
      }
    } catch {
      // Ignore local storage parse error
    } finally {
      setIsHydrated(true);
    }
  }, []);

  // Save cart to localStorage on change
  useEffect(() => {
    if (isHydrated) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
      } catch {
        // Storage quota or privacy mode error
      }
    }
  }, [items, isHydrated]);

  const addItem = (packOption: PackOption, quantity: number = 1) => {
    setItems((prevItems) => {
      const existingIndex = prevItems.findIndex(
        (item) => item.packOption.id === packOption.id
      );

      if (existingIndex > -1) {
        const updated = [...prevItems];
        updated[existingIndex] = {
          ...updated[existingIndex],
          quantity: updated[existingIndex].quantity + quantity,
        };
        return updated;
      }

      const newItem: CartItem = {
        productId: PRODUCT_CONFIG.id,
        productName: PRODUCT_CONFIG.name,
        packOption,
        quantity,
        image: PRODUCT_CONFIG.images[0]?.src || "/images/product-jar-hero.jpg",
      };
      return [...prevItems, newItem];
    });

    setIsDrawerOpen(true);
  };

  const removeItem = (packOptionId: string) => {
    setItems((prev) => prev.filter((item) => item.packOption.id !== packOptionId));
  };

  const updateQuantity = (packOptionId: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(packOptionId);
      return;
    }
    setItems((prev) =>
      prev.map((item) =>
        item.packOption.id === packOptionId ? { ...item, quantity } : item
      )
    );
  };

  const clearCart = () => {
    setItems([]);
  };

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);

  const subtotal = items.reduce(
    (sum, item) => sum + item.packOption.price * item.quantity,
    0
  );

  return (
    <CartContext.Provider
      value={{
        items,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        totalItems,
        subtotal,
        isDrawerOpen,
        openDrawer: () => setIsDrawerOpen(true),
        closeDrawer: () => setIsDrawerOpen(false),
        toggleDrawer: () => setIsDrawerOpen((prev) => !prev),
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}

