"use client";

import React, { createContext, useContext, useState, useEffect, useRef } from "react";
import { CartItem, CartContextType } from "@/types/cart";
import { PackOption } from "@/types/product";
import { PRODUCT_CONFIG } from "./product-config";
import { auth } from "@/lib/firebase/client";
import { onAuthStateChanged, User } from "firebase/auth";

const CartContext = createContext<CartContextType | undefined>(undefined);

const STORAGE_KEY = "gutglow_cart_v1";

function mapFirestoreCartItemToClient(item: any): CartItem {
  // Find matching pack configuration in PRODUCT_CONFIG if available
  const existingPack = PRODUCT_CONFIG.packOptions.find(
    (p) => p.id === item.packOptionId || p.id === `pack-${item.packOptionId}`
  );

  const packOption: PackOption = existingPack || {
    id: item.packOptionId,
    name: item.packName || "GutGlow Pack",
    subtitle: `${item.physicalUnitsCount || 1} ${item.physicalUnitsCount === 1 ? 'Unit' : 'Units'} (${(item.physicalUnitsCount || 1) * 30} Servings)`,
    servings: (item.physicalUnitsCount || 1) * 30,
    durationMonths: item.physicalUnitsCount || 1,
    price: Math.round(item.unitPriceInPaise / 100),
  };

  return {
    productId: item.productId,
    productName: item.productName || PRODUCT_CONFIG.name,
    packOption,
    quantity: item.quantity,
    image: item.image || PRODUCT_CONFIG.images[0]?.src || "/images/product-jar-hero.jpg",
  };
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isHydrated, setIsHydrated] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const currentUserRef = useRef<User | null>(null);
  const syncTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // 1. Initial Load from localStorage on Mount
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
      // Ignore localStorage parse errors
    } finally {
      setIsHydrated(true);
    }
  }, []);

  // 2. Authenticated Sync & Cart Merge on Login
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      currentUserRef.current = firebaseUser;

      if (!firebaseUser) return;

      try {
        setIsSyncing(true);
        const token = await firebaseUser.getIdToken();

        // If local items exist in storage, trigger server-side merge
        const localStored = localStorage.getItem(STORAGE_KEY);
        let localItems: CartItem[] = [];
        if (localStored) {
          try {
            const parsed = JSON.parse(localStored);
            if (Array.isArray(parsed) && parsed.length > 0) {
              localItems = parsed;
            }
          } catch {
            // Ignore
          }
        }

        if (localItems.length > 0) {
          // Merge local items into remote cart
          const mergePayload = {
            items: localItems.map((item) => ({
              productId: item.productId,
              packOptionId: item.packOption.id,
              quantity: item.quantity,
            })),
          };

          const res = await fetch("/api/v1/cart/merge", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(mergePayload),
          });

          if (res.ok) {
            const data = await res.json();
            if (data.success && data.data?.items) {
              const clientItems = data.data.items.map(mapFirestoreCartItemToClient);
              setItems(clientItems);
              localStorage.setItem(STORAGE_KEY, JSON.stringify(clientItems));
            }
          }
        } else {
          // No local items, fetch existing remote cart
          const res = await fetch("/api/v1/cart", {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });

          if (res.ok) {
            const data = await res.json();
            if (data.success && data.data?.items?.length) {
              const clientItems = data.data.items.map(mapFirestoreCartItemToClient);
              setItems(clientItems);
              localStorage.setItem(STORAGE_KEY, JSON.stringify(clientItems));
            }
          }
        }
      } catch (err) {
        console.warn("[Cart] Server hydration notice:", err);
      } finally {
        setIsSyncing(false);
      }
    });

    return () => unsubscribe();
  }, []);

  // 3. Local Storage & Background Remote Sync on Cart Changes
  useEffect(() => {
    if (!isHydrated) return;

    // Cache to localStorage immediately
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {
      // Ignore quota error
    }

    // If customer is signed in, sync to server in background with debounce
    if (currentUserRef.current) {
      if (syncTimeoutRef.current) {
        clearTimeout(syncTimeoutRef.current);
      }

      syncTimeoutRef.current = setTimeout(async () => {
        try {
          const user = currentUserRef.current;
          if (!user) return;
          const token = await user.getIdToken();

          await fetch("/api/v1/cart", {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              items: items.map((i) => ({
                productId: i.productId,
                packOptionId: i.packOption.id,
                quantity: i.quantity,
              })),
            }),
          });
        } catch {
          // Non-blocking background sync failure
        }
      }, 600);
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
          quantity: Math.min(10, updated[existingIndex].quantity + quantity),
        };
        return updated;
      }

      const newItem: CartItem = {
        productId: PRODUCT_CONFIG.id,
        productName: PRODUCT_CONFIG.name,
        packOption,
        quantity: Math.min(10, quantity),
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
        item.packOption.id === packOptionId
          ? { ...item, quantity: Math.min(10, quantity) }
          : item
      )
    );
  };

  const clearCart = () => {
    setItems([]);
    if (currentUserRef.current) {
      currentUserRef.current.getIdToken().then((token) => {
        fetch("/api/v1/cart", {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        }).catch(() => {});
      });
    }
  };

  const validateCartWithServer = async () => {
    const res = await fetch("/api/v1/cart/validate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        items: items.map((i) => ({
          productId: i.productId,
          packOptionId: i.packOption.id,
          quantity: i.quantity,
        })),
      }),
    });
    return res.json();
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
        validateCartWithServer,
        isSyncing,
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
