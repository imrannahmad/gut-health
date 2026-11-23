"use client";

import React, { useEffect } from "react";
import { usePathname } from "next/navigation";
import { CartProvider } from "@/lib/cart-context";
import { CartDrawer } from "@/components/cart/CartDrawer";

/**
 * Ensures instant scroll-to-top whenever the user switches between pages,
 * preventing any unwanted slow smooth "un-scroll" upward animation.
 */
function NavigationScrollReset() {
  const pathname = usePathname();

  useEffect(() => {
    // Instantly reset scroll to top (0, 0) on route change
    window.scrollTo({ top: 0, left: 0, behavior: "instant" as ScrollBehavior });
    if (document.documentElement) {
      document.documentElement.scrollTop = 0;
    }
    if (document.body) {
      document.body.scrollTop = 0;
    }
  }, [pathname]);

  return null;
}

export function ClientProviders({ children }: { children: React.ReactNode }) {
  return (
    <CartProvider>
      <NavigationScrollReset />
      {children}
      <CartDrawer />
    </CartProvider>
  );
}

