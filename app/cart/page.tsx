"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Plus, Minus, Trash2, ArrowRight, ArrowLeft } from "lucide-react";
import { AnnouncementBar } from "@/components/layout/AnnouncementBar";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { useCart } from "@/lib/cart-context";
import { formatPrice } from "@/lib/utils";

export default function CartPage() {
  const router = useRouter();
  const { items, updateQuantity, removeItem, subtotal, totalItems } = useCart();

  return (
    <div className="min-h-screen flex flex-col bg-[#FFFFFF]">
      <AnnouncementBar />
      <Header />

      <main className="flex-grow py-12 lg:py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold text-[#111111]">
                Your Bag
              </h1>
              <p className="text-xs text-[#666666] mt-1">
                {totalItems} {totalItems === 1 ? "item" : "items"} selected
              </p>
            </div>

            <Link
              href="/product"
              className="inline-flex items-center gap-1.5 text-xs uppercase tracking-wider font-semibold text-[#111111] hover:text-[#333333]"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Continue Shopping</span>
            </Link>
          </div>

          {items.length === 0 ? (
            <div className="bg-[#F5F5F5] border border-[#E5E5E5] rounded-2xl p-12 text-center max-w-md mx-auto space-y-4">
              <h3 className="text-lg font-bold text-[#111111]">
                Your bag is empty
              </h3>
              <p className="text-xs text-[#666666]">
                Begin your wellness routine with GutGlow Daily Wellness Formula.
              </p>
              <div className="pt-2">
                <Link
                  href="/product"
                  className="inline-flex items-center justify-center gap-2 bg-[#8BC5FF] text-[#111111] px-6 py-3 rounded-lg text-xs uppercase tracking-[0.14em] font-semibold hover:bg-[#7ABBF7] transition-colors"
                >
                  <span>Shop Formula</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
              {/* Items List */}
              <div className="lg:col-span-7 space-y-4">
                <div className="bg-[#FFFFFF] border border-[#E5E5E5] rounded-2xl p-6 divide-y divide-[#E5E5E5]">
                  {items.map((item) => (
                    <div key={item.packOption.id} className="py-6 first:pt-0 last:pb-0 flex gap-4">
                      <div className="relative w-20 h-24 bg-[#F5F5F5] rounded-xl overflow-hidden shrink-0 border border-[#E5E5E5]">
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
                              <h3 className="text-sm font-bold text-[#111111]">
                                {item.productName}
                              </h3>
                              <p className="text-xs text-[#666666] mt-0.5">
                                {item.packOption.name} · {item.packOption.servings} Servings
                              </p>
                            </div>
                            <button
                              type="button"
                              onClick={() => removeItem(item.packOption.id)}
                              className="text-[#666666] hover:text-[#111111] p-1"
                              aria-label="Remove item"
                            >
                              <Trash2 className="w-4 h-4 stroke-[1.5]" />
                            </button>
                          </div>
                        </div>

                        <div className="flex items-center justify-between pt-4">
                          <div className="flex items-center border border-[#E5E5E5] rounded-lg bg-[#F5F5F5] px-2.5 py-1">
                            <button
                              type="button"
                              onClick={() =>
                                updateQuantity(item.packOption.id, item.quantity - 1)
                              }
                              className="p-1 text-[#666666] hover:text-[#111111]"
                              aria-label="Decrease quantity"
                            >
                              <Minus className="w-3.5 h-3.5" />
                            </button>
                            <span className="px-3 text-xs font-semibold text-[#111111] min-w-[20px] text-center">
                              {item.quantity}
                            </span>
                            <button
                              type="button"
                              onClick={() =>
                                updateQuantity(item.packOption.id, item.quantity + 1)
                              }
                              className="p-1 text-[#666666] hover:text-[#111111]"
                              aria-label="Increase quantity"
                            >
                              <Plus className="w-3.5 h-3.5" />
                            </button>
                          </div>

                          <span className="text-sm font-bold text-[#111111]">
                            {formatPrice(item.packOption.price * item.quantity)}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Order Summary */}
              <div className="lg:col-span-5">
                <div className="bg-[#F5F5F5] border border-[#E5E5E5] rounded-xl p-6 sm:p-8 space-y-6 sticky top-24">
                  <h3 className="text-base font-bold text-[#111111]">
                    Order Summary
                  </h3>

                  <div className="space-y-3 text-xs text-[#666666] border-b border-[#E5E5E5] pb-4">
                    <div className="flex justify-between">
                      <span>Subtotal</span>
                      <span className="text-[#111111] font-semibold">{formatPrice(subtotal)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Express Shipping</span>
                      <span className="text-[#111111] font-semibold uppercase text-[10px] tracking-wider">
                        FREE
                      </span>
                    </div>
                  </div>

                  <div className="flex items-baseline justify-between">
                    <span className="font-semibold text-[#111111]">Total</span>
                    <span className="font-bold text-2xl text-[#111111]">
                      {formatPrice(subtotal)}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => router.push("/checkout")}
                    className="w-full flex items-center justify-center gap-2 bg-[#8BC5FF] text-[#111111] py-3.5 rounded-lg text-xs uppercase tracking-[0.14em] font-semibold hover:bg-[#7ABBF7] transition-colors"
                  >
                    <span>Proceed to Checkout</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
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
