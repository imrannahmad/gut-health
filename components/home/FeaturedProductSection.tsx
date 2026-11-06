"use client";

import React, { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  Check,
  Plus,
  Minus,
  ShoppingBag,
  ArrowRight,
  ShieldCheck,
  Truck,
  Leaf,
  Info,
} from "lucide-react";
import { PRODUCT_CONFIG } from "@/lib/product-config";
import { useCart } from "@/lib/cart-context";
import { formatPrice } from "@/lib/utils";
import { PincodeChecker } from "@/components/ui/PincodeChecker";
import { Accordion } from "@/components/ui/Accordion";
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
    setTimeout(() => setAddedNotice(false), 2500);
  };

  const handleBuyNow = () => {
    addItem(selectedPack, quantity);
    router.push("/checkout");
  };

  const accordionItems = [
    {
      id: "ingredients",
      title: "Ingredients & Formulation Status",
      content: (
        <div className="space-y-3">
          <div className="p-3 bg-[#EEEBDD]/70 rounded-lg text-xs text-[#575D52] border border-[#E6E1D3]">
            <span className="font-semibold text-[#173D32] block mb-1">
              {PRODUCT_CONFIG.ingredientsNote}
            </span>
          </div>
          <div className="space-y-2 pt-1">
            {PRODUCT_CONFIG.provisionalIngredients.map((item, idx) => (
              <div key={idx} className="text-xs">
                <span className="font-semibold text-[#173D32] block">
                  {item.category}:
                </span>
                <span className="text-[#575D52] block">{item.items.join(", ")}</span>
                <span className="text-[11px] text-[#A9B9A0] block italic mt-0.5">
                  Purpose: {item.purpose}
                </span>
              </div>
            ))}
          </div>
        </div>
      ),
    },
    {
      id: "usage",
      title: "Suggested Usage & Directions",
      content: (
        <div className="space-y-3">
          {PRODUCT_CONFIG.directions.map((dir, idx) => (
            <div key={idx} className="text-xs">
              <span className="font-semibold text-[#173D32] block">
                {dir.step}
              </span>
              <span className="text-[#575D52]">{dir.instruction}</span>
            </div>
          ))}
          <p className="text-[11px] text-[#575D52]/80 pt-1 italic">
            *Final quantitative dosage and serving scoop guidelines to be confirmed upon manufacturing release.
          </p>
        </div>
      ),
    },
    {
      id: "safety",
      title: "Safety, Precautions & Storage",
      content: (
        <div className="space-y-2 text-xs text-[#575D52]">
          <ul className="list-disc list-inside space-y-1">
            {PRODUCT_CONFIG.safetyInformation.map((info, idx) => (
              <li key={idx} className="leading-relaxed">
                {info}
              </li>
            ))}
          </ul>
          <p className="pt-2 text-[11px] font-medium text-[#173D32]">
            Storage: {PRODUCT_CONFIG.storageInstructions}
          </p>
        </div>
      ),
    },
  ];

  return (
    <section
      id="product-section"
      className="py-24 lg:py-32 bg-[#F8F6EF] border-b border-[#E6E1D3]"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Pre-heading */}
        <div className="text-center max-w-xl mx-auto mb-16 space-y-3">
          <span className="text-[11px] font-semibold tracking-[0.22em] uppercase text-[#173D32]">
            OUR SOLE FLAGSHIP FORMULA
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-serif text-[#173D32]">
            Thoughtfully Developed
          </h2>
          <p className="text-sm text-[#575D52]">
            One purposeful product engineered for daily digestive harmony. No
            clutter, no confusing regimens.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16">
          {/* Left Column: Product Gallery */}
          <div className="lg:col-span-7 space-y-4">
            {/* Main Stage Image */}
            <div className="relative aspect-square sm:aspect-[4/3] rounded-3xl overflow-hidden bg-[#EEEBDD] border border-[#E6E1D3] shadow-sm">
              <Image
                src={PRODUCT_CONFIG.images[selectedImageIndex]?.src || "/images/product-jar-hero.jpg"}
                alt={PRODUCT_CONFIG.images[selectedImageIndex]?.alt || PRODUCT_CONFIG.name}
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 650px"
                className="object-cover object-center transition-all duration-500"
              />

              {/* Pack badge overlay */}
              {selectedPack.badge && (
                <div className="absolute top-4 left-4 bg-[#173D32] text-[#F8F6EF] text-[10px] tracking-[0.16em] uppercase px-3 py-1.5 rounded-full font-medium shadow-sm">
                  {selectedPack.badge}
                </div>
              )}
            </div>

            {/* Thumbnail Row */}
            <div className="grid grid-cols-4 gap-3 sm:gap-4">
              {PRODUCT_CONFIG.images.map((img, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setSelectedImageIndex(idx)}
                  className={`relative aspect-square rounded-xl overflow-hidden bg-[#EEEBDD] border-2 transition-all ${
                    selectedImageIndex === idx
                      ? "border-[#173D32] ring-2 ring-[#173D32]/20"
                      : "border-transparent opacity-70 hover:opacity-100"
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

            {/* Product Guarantees Pill Bar */}
            <div className="p-4 bg-[#EEEBDD]/40 rounded-2xl border border-[#E6E1D3] flex flex-wrap items-center justify-around gap-4 text-xs text-[#575D52]">
              <div className="flex items-center gap-1.5">
                <Leaf className="w-4 h-4 text-[#7D9273]" />
                <span>100% Plant-Derived</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Truck className="w-4 h-4 text-[#7D9273]" />
                <span>Free Express Shipping</span>
              </div>
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-[#7D9273]" />
                <span>Lab Batch Tested</span>
              </div>
            </div>
          </div>

          {/* Right Column: Commercial Product Information & Actions */}
          <div className="lg:col-span-5 space-y-6">
            <div>
              <span className="text-[11px] uppercase tracking-[0.2em] font-semibold text-[#B99A63]">
                {PRODUCT_CONFIG.category}
              </span>
              <h1 className="text-2xl sm:text-3xl font-serif text-[#173D32] mt-1 font-normal">
                {PRODUCT_CONFIG.name}
              </h1>
              <p className="text-xs text-[#575D52] italic mt-1">
                {PRODUCT_CONFIG.tagline}
              </p>
            </div>

            {/* Price block */}
            <div className="flex items-baseline gap-3 pb-4 border-b border-[#E6E1D3]">
              <span className="text-3xl font-serif font-medium text-[#173D32]">
                {formatPrice(selectedPack.price)}
              </span>
              {selectedPack.compareAtPrice && (
                <span className="text-base text-[#575D52] line-through">
                  {formatPrice(selectedPack.compareAtPrice)}
                </span>
              )}
              <span className="text-xs text-[#7D9273] font-medium bg-[#A9B9A0]/20 px-2.5 py-0.5 rounded-full">
                Taxes Included
              </span>
            </div>

            {/* Short Description */}
            <p className="text-sm text-[#575D52] leading-relaxed">
              {PRODUCT_CONFIG.shortDescription}
            </p>

            {/* Pack Size Selector */}
            <div className="space-y-3">
              <label className="block text-xs uppercase tracking-[0.16em] font-semibold text-[#173D32]">
                Select Supply Pack
              </label>
              <div className="space-y-2.5">
                {PRODUCT_CONFIG.packOptions.map((pack) => {
                  const isSelected = selectedPack.id === pack.id;
                  return (
                    <button
                      key={pack.id}
                      type="button"
                      onClick={() => setSelectedPack(pack)}
                      className={`w-full text-left p-3.5 rounded-2xl border transition-all flex items-center justify-between ${
                        isSelected
                          ? "border-[#173D32] bg-[#EEEBDD]/70 shadow-sm ring-1 ring-[#173D32]/20"
                          : "border-[#E6E1D3] bg-[#F8F6EF] hover:border-[#173D32]/40"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                            isSelected
                              ? "border-[#173D32] bg-[#173D32]"
                              : "border-[#A9B9A0]"
                          }`}
                        >
                          {isSelected && <div className="w-1.5 h-1.5 bg-[#F8F6EF] rounded-full" />}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium text-[#173D32]">
                              {pack.name}
                            </span>
                            {pack.badge && (
                              <span className="text-[10px] uppercase tracking-wider font-semibold bg-[#173D32] text-[#F8F6EF] px-2 py-0.5 rounded-full">
                                {pack.badge}
                              </span>
                            )}
                          </div>
                          <span className="text-xs text-[#575D52]">
                            {pack.subtitle}
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="text-sm font-medium text-[#173D32]">
                          {formatPrice(pack.price)}
                        </span>
                        {pack.compareAtPrice && (
                          <span className="block text-[11px] text-[#575D52] line-through">
                            {formatPrice(pack.compareAtPrice)}
                          </span>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Quantity Stepper & CTA Row */}
            <div className="space-y-3 pt-2">
              <div className="flex items-center gap-4">
                {/* Quantity */}
                <div className="flex items-center border border-[#E6E1D3] rounded-full bg-[#EEEBDD]/50 px-3 py-2">
                  <button
                    type="button"
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    className="p-1 text-[#575D52] hover:text-[#173D32]"
                    aria-label="Decrease quantity"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="px-3 text-sm font-medium text-[#173D32] min-w-[24px] text-center">
                    {quantity}
                  </span>
                  <button
                    type="button"
                    onClick={() => setQuantity((q) => q + 1)}
                    className="p-1 text-[#575D52] hover:text-[#173D32]"
                    aria-label="Increase quantity"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>

                {/* Add to Cart */}
                <button
                  type="button"
                  onClick={handleAddToCart}
                  className="flex-1 flex items-center justify-center gap-2 bg-[#173D32] text-[#F8F6EF] py-3.5 px-6 rounded-full text-xs uppercase tracking-[0.18em] font-medium hover:bg-[#122e26] transition-all shadow-sm active:scale-[0.99]"
                >
                  <ShoppingBag className="w-4 h-4" />
                  <span>Add to Bag</span>
                </button>
              </div>

              {/* Buy Now button */}
              <button
                type="button"
                onClick={handleBuyNow}
                className="w-full flex items-center justify-center gap-2 bg-[#B99A63] text-[#173D32] py-3.5 px-6 rounded-full text-xs uppercase tracking-[0.18em] font-semibold hover:bg-[#A88B56] transition-all shadow-sm"
              >
                <span>Buy Now · Direct Checkout</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              {addedNotice && (
                <div className="bg-[#EEEBDD] text-[#173D32] text-xs py-2 px-4 rounded-xl flex items-center justify-center gap-2 animate-fadeIn">
                  <Check className="w-4 h-4 text-[#7D9273]" />
                  <span>Added {selectedPack.name} to your wellness bag!</span>
                </div>
              )}
            </div>

            {/* Delivery Pincode Checker */}
            <div className="pt-2">
              <PincodeChecker />
            </div>

            {/* Product Details Accordion */}
            <div className="pt-4">
              <Accordion items={accordionItems} defaultOpenId="ingredients" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
