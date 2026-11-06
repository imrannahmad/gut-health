"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Plus, Minus, Trash2, ArrowRight, ShieldCheck, Truck, ArrowLeft } from "lucide-react";
import { AnnouncementBar } from "@/components/layout/AnnouncementBar";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { useCart } from "@/lib/cart-context";
import { formatPrice } from "@/lib/utils";

export default function CartPage() {
  const router = useRouter();
  const { items, updateQuantity, removeItem, subtotal, totalItems } = useCart();

  return (
    <div className="min-h-screen flex flex-col bg-[#F8F6EF]">
      <AnnouncementBar />
      <Header />

      <main className="flex-grow py-12 lg:py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h1 className="text-3xl sm:text-4xl font-serif text-[#173D32]">
                Your Wellness Bag
              </h1>
              <p className="text-xs sm:text-sm text-[#575D52] mt-1">
                {totalItems} {totalItems === 1 ? "item" : "items"} selected for delivery
              </p>
            </div>

            <Link
              href="/product"
              className="inline-flex items-center gap-1.5 text-xs uppercase tracking-wider text-[#173D32] hover:text-[#0E2921]"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Continue Shopping</span>
            </Link>
          </div>

          {items.length === 0 ? (
            <div className="bg-[#EEEBDD]/40 border border-[#E6E1D3] rounded-3xl p-12 text-center max-w-lg mx-auto space-y-6">
              <div className="w-16 h-16 rounded-full bg-[#EEEBDD] flex items-center justify-center text-[#173D32] mx-auto">
                <Image
                  src="/images/gutglow-logo.png"
                  alt="GutGlow"
                  width={70}
                  height={24}
                  className="opacity-70"
                />
              </div>
              <div className="space-y-1">
                <h3 className="text-xl font-serif text-[#173D32]">
                  Your bag is empty
                </h3>
                <p className="text-xs text-[#575D52]">
                  Begin your wellness ritual with our single flagship daily formula.
                </p>
              </div>
              <Link
                href="/product"
                className="inline-flex items-center justify-center gap-2 bg-[#173D32] text-[#F8F6EF] px-8 py-3.5 rounded-full text-xs uppercase tracking-[0.18em] font-medium hover:bg-[#122e26] transition-colors shadow"
              >
                <span>Discover Flagship Formula</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
              {/* Items List */}
              <div className="lg:col-span-7 space-y-4">
                <div className="bg-[#F8F6EF] border border-[#E6E1D3] rounded-3xl p-6 divide-y divide-[#E6E1D3]">
                  {items.map((item) => (
                    <div key={item.packOption.id} className="py-6 first:pt-0 last:pb-0 flex gap-5">
                      <div className="relative w-24 h-28 bg-[#EEEBDD] rounded-2xl overflow-hidden shrink-0 border border-[#E6E1D3]">
                        <Image
                          src={item.image}
                          alt={item.productName}
                          fill
                          sizes="100px"
                          className="object-cover"
                        />
                      </div>

                      <div className="flex-1 flex flex-col justify-between">
                        <div>
                          <div className="flex justify-between items-start">
                            <div>
                              <h3 className="text-base font-serif font-medium text-[#173D32]">
                                {item.productName}
                              </h3>
                              <p className="text-xs text-[#B99A63] font-medium mt-0.5">
                                {item.packOption.name} · {item.packOption.servings} Servings
                              </p>
                            </div>
                            <button
                              type="button"
                              onClick={() => removeItem(item.packOption.id)}
                              className="text-[#575D52] hover:text-[#c0392b] p-1"
                              aria-label="Remove item"
                            >
                              <Trash2 className="w-4 h-4 stroke-[1.5]" />
                            </button>
                          </div>
                          <p className="text-xs text-[#575D52] mt-1">
                            {item.packOption.subtitle}
                          </p>
                        </div>

                        <div className="flex items-center justify-between pt-4">
                          {/* Stepper */}
                          <div className="flex items-center border border-[#E6E1D3] rounded-full bg-[#EEEBDD]/50 px-2.5 py-1">
                            <button
                              type="button"
                              onClick={() =>
                                updateQuantity(item.packOption.id, item.quantity - 1)
                              }
                              className="p-1 text-[#575D52] hover:text-[#173D32]"
                              aria-label="Decrease quantity"
                            >
                              <Minus className="w-3.5 h-3.5" />
                            </button>
                            <span className="px-3 text-xs font-medium text-[#173D32] min-w-[24px] text-center">
                              {item.quantity}
                            </span>
                            <button
                              type="button"
                              onClick={() =>
                                updateQuantity(item.packOption.id, item.quantity + 1)
                              }
                              className="p-1 text-[#575D52] hover:text-[#173D32]"
                              aria-label="Increase quantity"
                            >
                              <Plus className="w-3.5 h-3.5" />
                            </button>
                          </div>

                          <div className="text-right">
                            <span className="text-base font-medium text-[#173D32]">
                              {formatPrice(item.packOption.price * item.quantity)}
                            </span>
                            {item.packOption.compareAtPrice && (
                              <span className="block text-xs text-[#575D52] line-through">
                                {formatPrice(item.packOption.compareAtPrice * item.quantity)}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Order Summary & Actions */}
              <div className="lg:col-span-5">
                <div className="bg-[#EEEBDD]/60 border border-[#E6E1D3] rounded-3xl p-6 sm:p-8 space-y-6 sticky top-28">
                  <h3 className="text-lg font-serif font-medium text-[#173D32]">
                    Order Summary
                  </h3>

                  <div className="space-y-3 text-xs text-[#575D52] border-b border-[#E6E1D3] pb-4">
                    <div className="flex justify-between">
                      <span>Items Subtotal</span>
                      <span className="text-[#173D32] font-medium">{formatPrice(subtotal)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="flex items-center gap-1.5">
                        <Truck className="w-3.5 h-3.5 text-[#7D9273]" />
                        <span>Express Shipping (All India)</span>
                      </span>
                      <span className="text-[#173D32] font-semibold uppercase tracking-wider text-[11px]">
                        FREE
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Estimated GST & Local Taxes</span>
                      <span className="text-[#173D32]">Included</span>
                    </div>
                  </div>

                  <div className="flex items-baseline justify-between text-lg">
                    <span className="font-serif font-medium text-[#173D32]">Total</span>
                    <span className="font-medium text-2xl text-[#173D32] font-serif">
                      {formatPrice(subtotal)}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => router.push("/checkout")}
                    className="w-full flex items-center justify-center gap-2 bg-[#173D32] text-[#F8F6EF] py-4 rounded-full text-xs uppercase tracking-[0.18em] font-medium hover:bg-[#122e26] transition-all shadow"
                  >
                    <span>Proceed to Checkout</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>

                  <div className="pt-2 text-center space-y-2">
                    <div className="flex items-center justify-center gap-2 text-[11px] text-[#575D52]">
                      <ShieldCheck className="w-4 h-4 text-[#7D9273]" />
                      <span>Encrypted SSL 256-Bit Secure Payment Gateway</span>
                    </div>
                    <p className="text-[10px] text-[#A9B9A0] uppercase tracking-wider">
                      UPI · Cards · NetBanking · Cash on Delivery
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
