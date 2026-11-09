"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Plus, Minus, ShoppingBag, ArrowRight, Check } from "lucide-react";
import { PRODUCT_CONFIG } from "@/lib/product-config";
import { useCart } from "@/lib/cart-context";
import { formatPrice } from "@/lib/utils";
import { PincodeChecker } from "@/components/ui/PincodeChecker";
import { PackOption } from "@/types/product";

export function FeaturedProductSection() {
  const router = useRouter();
  const { addItem } = useCart();

  const [selectedPack, setSelectedPack] = useState<PackOption>(
    PRODUCT_CONFIG.packOptions.find((p) => p.isPopular) || PRODUCT_CONFIG.packOptions[0]
  );
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [addedNotice, setAddedNotice] = useState(false);

  const handleAddToCart = () => {
    addItem(selectedPack, quantity);
    setAddedNotice(true);
    setTimeout(() => setAddedNotice(false), 2000);
  };

  const handleBuyNow = () => {
    addItem(selectedPack, quantity);
    router.push("/checkout");
  };

  return (
    <section id="product-section" className="py-20 lg:py-28 bg-[#FFFFFF] border-b border-[#E5E5E5]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Heading */}
        <div className="mb-10 sm:mb-16">
          <span className="text-[11px] font-semibold tracking-[0.2em] uppercase text-[#666666] block mb-2">
            FLAGSHIP PRODUCT
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-[#111111]">
            Meet GutGlow.
          </h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
          {/* Left Column: Large Product Image + Clean Selector */}
          <div className="lg:col-span-7 space-y-4">
            <div className="relative aspect-square sm:aspect-[4/3] rounded-xl overflow-hidden bg-[#F5F5F5] border border-[#E5E5E5]">
              <Image
                src={PRODUCT_CONFIG.images[selectedImageIndex]?.src || "/images/product-jar-front.jpg"}
                alt={PRODUCT_CONFIG.name}
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 680px"
                className="object-cover object-center"
              />
            </div>

            {/* Thumbnails */}
            <div className="grid grid-cols-5 gap-2 sm:gap-3">
              {PRODUCT_CONFIG.images.map((img, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setSelectedImageIndex(idx)}
                  className={`relative aspect-square rounded-lg overflow-hidden bg-[#F5F5F5] border transition-all ${
                    selectedImageIndex === idx
                      ? "border-[#111111] ring-1 ring-[#111111]"
                      : "border-[#E5E5E5] opacity-80 hover:opacity-100"
                  }`}
                  aria-label={`View ${img.label}`}
                >
                  <Image
                    src={img.src}
                    alt={img.alt}
                    fill
                    sizes="120px"
                    className="object-cover object-center"
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Right Column: Commercial Product Information */}
          <div className="lg:col-span-5 space-y-6">
            <div>
              <p className="text-[11px] uppercase tracking-[0.2em] font-semibold text-[#666666]">
                {PRODUCT_CONFIG.category}
              </p>
              <h3 className="text-2xl sm:text-3xl font-bold text-[#111111] mt-1">
                {PRODUCT_CONFIG.name}
              </h3>
            </div>

            {/* Price */}
            <div className="flex items-baseline gap-3 pb-4 border-b border-[#E5E5E5]">
              <span className="text-3xl font-bold text-[#111111]">
                {formatPrice(selectedPack.price)}
              </span>
              {selectedPack.compareAtPrice && (
                <span className="text-sm text-[#666666] line-through">
                  {formatPrice(selectedPack.compareAtPrice)}
                </span>
              )}
              <span className="text-xs text-[#666666] uppercase tracking-wider font-medium ml-auto">
                Free Express Delivery
              </span>
            </div>

            {/* Short Description */}
            <p className="text-sm text-[#666666] leading-relaxed">
              {PRODUCT_CONFIG.shortDescription}
            </p>

            {/* Pack Size Selector */}
            <div className="space-y-2.5">
              <label className="block text-xs uppercase tracking-[0.14em] font-semibold text-[#111111]">
                Select Supply Pack
              </label>
              <div className="space-y-2">
                {PRODUCT_CONFIG.packOptions.map((pack) => {
                  const isSelected = selectedPack.id === pack.id;
                  return (
                    <button
                      key={pack.id}
                      type="button"
                      onClick={() => setSelectedPack(pack)}
                      className={`w-full text-left p-3.5 rounded-lg border transition-all flex items-center justify-between ${
                        isSelected
                          ? "border-[#111111] bg-[#F5F5F5] ring-1 ring-[#111111]"
                          : "border-[#E5E5E5] bg-[#FFFFFF] hover:border-[#111111]/40"
                      }`}
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-semibold text-[#111111]">
                            {pack.name}
                          </span>
                          {pack.badge && (
                            <span className="text-[9px] uppercase tracking-wider font-semibold bg-[#111111] text-[#FFFFFF] px-2 py-0.5 rounded">
                              {pack.badge}
                            </span>
                          )}
                        </div>
                        <span className="text-[11px] text-[#666666]">
                          {pack.subtitle}
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="text-xs font-bold text-[#111111]">
                          {formatPrice(pack.price)}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Quantity & Actions (rounded-lg buttons) */}
            <div className="space-y-3 pt-2">
              <div className="flex items-center gap-3">
                {/* Quantity Stepper */}
                <div className="flex items-center border border-[#E5E5E5] rounded-lg bg-[#F5F5F5] px-3 py-2.5">
                  <button
                    type="button"
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    className="p-1 text-[#666666] hover:text-[#111111]"
                    aria-label="Decrease quantity"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <span className="px-3 text-xs font-semibold text-[#111111] min-w-[20px] text-center">
                    {quantity}
                  </span>
                  <button
                    type="button"
                    onClick={() => setQuantity((q) => q + 1)}
                    className="p-1 text-[#666666] hover:text-[#111111]"
                    aria-label="Increase quantity"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Primary: Add to Cart */}
                <button
                  type="button"
                  onClick={handleAddToCart}
                  className="flex-1 flex items-center justify-center gap-2 bg-[#111111] text-[#FFFFFF] py-3.5 px-6 rounded-lg text-xs uppercase tracking-[0.14em] font-medium hover:bg-[#333333] transition-colors"
                >
                  <ShoppingBag className="w-4 h-4" />
                  <span>Add to Cart</span>
                </button>
              </div>

              {/* Secondary: Buy Now */}
              <button
                type="button"
                onClick={handleBuyNow}
                className="w-full flex items-center justify-center gap-2 bg-[#FFFFFF] text-[#111111] border border-[#E5E5E5] py-3.5 px-6 rounded-lg text-xs uppercase tracking-[0.14em] font-semibold hover:border-[#111111] hover:bg-[#F5F5F5] transition-colors"
              >
                <span>Buy Now · Direct Checkout</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              {addedNotice && (
                <div className="bg-[#111111] text-[#FFFFFF] text-xs py-2 px-4 rounded-lg flex items-center justify-center gap-2">
                  <Check className="w-3.5 h-3.5" />
                  <span>Added {selectedPack.name} to your bag</span>
                </div>
              )}
            </div>

            {/* View Details Link */}
            <div className="pt-2 flex items-center justify-between border-t border-[#E5E5E5]">
              <Link
                href="/product"
                className="inline-flex items-center gap-2 text-xs uppercase tracking-wider font-semibold text-[#111111] hover:text-[#666666] transition-colors group"
              >
                <span>View Full Details & Formulation</span>
                <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
              </Link>
            </div>

            {/* Delivery Pincode Checker */}
            <div className="pt-2">
              <PincodeChecker />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
