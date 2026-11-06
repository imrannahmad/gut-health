"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Plus, Minus, ShoppingBag, ArrowRight, Check, Truck, ShieldCheck, RefreshCw } from "lucide-react";
import { AnnouncementBar } from "@/components/layout/AnnouncementBar";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { PRODUCT_CONFIG } from "@/lib/product-config";
import { useCart } from "@/lib/cart-context";
import { formatPrice } from "@/lib/utils";
import { PincodeChecker } from "@/components/ui/PincodeChecker";
import { Accordion } from "@/components/ui/Accordion";
import { PackOption } from "@/types/product";

export default function ProductDetailPage() {
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

  const accordionItems = [
    {
      id: "details-overview",
      title: "Formula Overview",
      content: (
        <div className="space-y-3">
          <p className="text-xs text-[#777777] leading-relaxed">
            {PRODUCT_CONFIG.fullDescription}
          </p>
          <div className="grid grid-cols-2 gap-2 pt-1">
            {PRODUCT_CONFIG.specifications.map((spec, idx) => (
              <div key={idx} className="bg-[#F7F7F7] p-2.5 rounded-lg border border-[#E8E8E8]">
                <span className="text-[10px] uppercase tracking-wider text-[#777777] block font-medium">
                  {spec.label}
                </span>
                <span className="text-xs font-semibold text-[#111111]">
                  {spec.value}
                </span>
              </div>
            ))}
          </div>
        </div>
      ),
    },
    {
      id: "details-ingredients",
      title: "Ingredients & Formulation",
      content: (
        <div className="space-y-3">
          <p className="text-xs text-[#777777] italic pb-1">
            {PRODUCT_CONFIG.ingredientsNote}
          </p>
          <div className="space-y-2.5">
            {PRODUCT_CONFIG.provisionalIngredients.map((cat, idx) => (
              <div key={idx} className="border-b border-[#E8E8E8] pb-2 last:border-b-0">
                <span className="text-xs font-semibold text-[#111111] block">
                  {cat.category}
                </span>
                <span className="text-xs text-[#777777] block mt-0.5">
                  {cat.items.join(" · ")}
                </span>
              </div>
            ))}
          </div>
        </div>
      ),
    },
    {
      id: "details-directions",
      title: "Directions For Use",
      content: (
        <div className="space-y-2.5">
          {PRODUCT_CONFIG.directions.map((step, idx) => (
            <div key={idx} className="flex gap-2.5 text-xs">
              <span className="w-5 h-5 rounded-full bg-[#111111] text-[#FFFFFF] flex items-center justify-center text-[10px] font-bold shrink-0">
                {idx + 1}
              </span>
              <div>
                <span className="font-semibold text-[#111111] block">
                  {step.step}
                </span>
                <span className="text-[#777777]">{step.instruction}</span>
              </div>
            </div>
          ))}
        </div>
      ),
    },
    {
      id: "details-safety",
      title: "Safety & Storage",
      content: (
        <div className="space-y-2 text-xs text-[#777777]">
          <ul className="list-disc list-inside space-y-1">
            {PRODUCT_CONFIG.safetyInformation.map((info, idx) => (
              <li key={idx} className="leading-relaxed">
                {info}
              </li>
            ))}
          </ul>
          <p className="pt-2 text-[11px] font-medium text-[#111111]">
            Storage: {PRODUCT_CONFIG.storageInstructions}
          </p>
        </div>
      ),
    },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-[#FFFFFF]">
      <AnnouncementBar />
      <Header />

      <main className="flex-grow py-8 lg:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Breadcrumb */}
          <nav className="text-[11px] uppercase tracking-wider text-[#777777] mb-8 flex items-center gap-2">
            <Link href="/" className="hover:text-[#111111] transition-colors">
              Home
            </Link>
            <span>/</span>
            <span className="text-[#111111] font-semibold">Flagship Formula</span>
          </nav>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16">
            {/* Left: Product Gallery */}
            <div className="lg:col-span-7 space-y-4">
              {/* Mobile Swipeable Gallery */}
              <div className="lg:hidden">
                <div className="flex overflow-x-auto snap-x snap-mandatory no-scrollbar gap-3 -mx-4 px-4 pb-2">
                  {PRODUCT_CONFIG.images.map((img, idx) => (
                    <div
                      key={idx}
                      className="shrink-0 w-[88vw] snap-start relative aspect-square rounded-2xl overflow-hidden bg-[#F7F7F7] border border-[#E8E8E8]"
                    >
                      <Image
                        src={img.src}
                        alt={img.alt}
                        fill
                        priority={idx === 0}
                        sizes="90vw"
                        className="object-cover grayscale contrast-125"
                      />
                      <div className="absolute bottom-3 right-3 bg-[#FFFFFF]/90 px-2 py-0.5 rounded text-[10px] font-semibold text-[#111111]">
                        {idx + 1} / {PRODUCT_CONFIG.images.length}
                      </div>
                    </div>
                  ))}
                </div>
                <div className="flex justify-center gap-1.5 pt-2">
                  {PRODUCT_CONFIG.images.map((_, idx) => (
                    <div
                      key={idx}
                      className="w-1.5 h-1.5 rounded-full bg-[#111111]/30"
                    />
                  ))}
                </div>
              </div>

              {/* Desktop Large Image */}
              <div className="hidden lg:block relative aspect-square rounded-2xl overflow-hidden bg-[#F7F7F7] border border-[#E8E8E8]">
                <Image
                  src={PRODUCT_CONFIG.images[selectedImageIndex]?.src || "/images/product-jar-hero.jpg"}
                  alt={PRODUCT_CONFIG.name}
                  fill
                  priority
                  sizes="650px"
                  className="object-cover grayscale contrast-125"
                />
              </div>

              {/* Desktop Thumbnails */}
              <div className="hidden lg:grid grid-cols-4 gap-3">
                {PRODUCT_CONFIG.images.map((img, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setSelectedImageIndex(idx)}
                    className={`relative aspect-square rounded-xl overflow-hidden bg-[#F7F7F7] border transition-all ${
                      selectedImageIndex === idx
                        ? "border-[#111111] ring-1 ring-[#111111]"
                        : "border-[#E8E8E8] opacity-60 hover:opacity-100"
                    }`}
                    aria-label={`View ${img.label}`}
                  >
                    <Image
                      src={img.src}
                      alt={img.alt}
                      fill
                      sizes="140px"
                      className="object-cover grayscale"
                    />
                  </button>
                ))}
              </div>

              {/* Trust Badges Bar */}
              <div className="grid grid-cols-3 gap-3 pt-4">
                <div className="p-3 bg-[#F7F7F7] rounded-xl border border-[#E8E8E8] text-center">
                  <p className="text-xs font-bold text-[#111111]">Clean Actives</p>
                  <p className="text-[10px] text-[#777777]">Plant-derived</p>
                </div>
                <div className="p-3 bg-[#F7F7F7] rounded-xl border border-[#E8E8E8] text-center">
                  <p className="text-xs font-bold text-[#111111]">Lab Verified</p>
                  <p className="text-[10px] text-[#777777]">ISO & GMP facility</p>
                </div>
                <div className="p-3 bg-[#F7F7F7] rounded-xl border border-[#E8E8E8] text-center">
                  <p className="text-xs font-bold text-[#111111]">Glass Packaging</p>
                  <p className="text-[10px] text-[#777777]">100% recyclable</p>
                </div>
              </div>
            </div>

            {/* Right: Product Actions */}
            <div className="lg:col-span-5 space-y-6">
              <div>
                <p className="text-[11px] uppercase tracking-[0.2em] font-semibold text-[#777777]">
                  {PRODUCT_CONFIG.category}
                </p>
                <h1 className="text-3xl sm:text-4xl font-bold text-[#111111] mt-1">
                  {PRODUCT_CONFIG.name}
                </h1>
                <p className="text-xs text-[#777777] mt-1">
                  {PRODUCT_CONFIG.tagline}
                </p>
              </div>

              {/* Price */}
              <div className="flex items-baseline gap-3 pb-4 border-b border-[#E8E8E8]">
                <span className="text-3xl font-bold text-[#111111]">
                  {formatPrice(selectedPack.price)}
                </span>
                {selectedPack.compareAtPrice && (
                  <span className="text-sm text-[#777777] line-through">
                    {formatPrice(selectedPack.compareAtPrice)}
                  </span>
                )}
                <span className="text-xs text-[#777777] uppercase tracking-wider font-medium ml-auto">
                  Free Express Delivery
                </span>
              </div>

              {/* Short Description */}
              <p className="text-xs sm:text-sm text-[#777777] leading-relaxed">
                {PRODUCT_CONFIG.shortDescription}
              </p>

              {/* Pack Selector */}
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
                        className={`w-full text-left p-3.5 rounded-xl border transition-all flex items-center justify-between ${
                          isSelected
                            ? "border-[#111111] bg-[#F7F7F7] ring-1 ring-[#111111]"
                            : "border-[#E8E8E8] bg-[#FFFFFF] hover:border-[#111111]/40"
                        }`}
                      >
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-semibold text-[#111111]">
                              {pack.name}
                            </span>
                            {pack.badge && (
                              <span className="text-[9px] uppercase tracking-wider font-semibold bg-[#111111] text-[#FFFFFF] px-2 py-0.5 rounded-full">
                                {pack.badge}
                              </span>
                            )}
                          </div>
                          <span className="text-[11px] text-[#777777]">
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

              {/* Quantity Stepper & Add to Cart */}
              <div className="space-y-3 pt-2">
                <div className="flex items-center gap-3">
                  <div className="flex items-center border border-[#E8E8E8] rounded-full bg-[#F7F7F7] px-3 py-2.5">
                    <button
                      type="button"
                      onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                      className="p-1 text-[#777777] hover:text-[#111111]"
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
                      className="p-1 text-[#777777] hover:text-[#111111]"
                      aria-label="Increase quantity"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={handleAddToCart}
                    className="flex-1 flex items-center justify-center gap-2 bg-[#111111] text-[#FFFFFF] py-3.5 px-6 rounded-full text-xs uppercase tracking-[0.16em] font-medium hover:bg-[#333333] transition-colors"
                  >
                    <ShoppingBag className="w-4 h-4" />
                    <span>Add to Cart</span>
                  </button>
                </div>

                <button
                  type="button"
                  onClick={handleBuyNow}
                  className="w-full flex items-center justify-center gap-2 bg-[#F7F7F7] text-[#111111] border border-[#111111] py-3.5 px-6 rounded-full text-xs uppercase tracking-[0.16em] font-semibold hover:bg-[#111111] hover:text-[#FFFFFF] transition-colors"
                >
                  <span>Buy Now · Direct Checkout</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                {addedNotice && (
                  <div className="bg-[#111111] text-[#FFFFFF] text-xs py-2 px-4 rounded-xl flex items-center justify-center gap-2">
                    <Check className="w-3.5 h-3.5" />
                    <span>Added {selectedPack.name} to your bag</span>
                  </div>
                )}
              </div>

              {/* Pincode Checker */}
              <div className="pt-2">
                <PincodeChecker />
              </div>

              {/* Accordion Tabs */}
              <div className="pt-2">
                <Accordion items={accordionItems} defaultOpenId="details-overview" />
              </div>
            </div>
          </div>
        </div>

        {/* Sticky Mobile Add to Cart Bar */}
        <div className="lg:hidden fixed bottom-0 inset-x-0 bg-[#FFFFFF]/95 backdrop-blur-md border-t border-[#E8E8E8] p-3.5 z-30 flex items-center justify-between gap-3 shadow-[0_-4px_16px_rgba(0,0,0,0.06)]">
          <div>
            <span className="text-[10px] text-[#777777] block line-clamp-1">
              {selectedPack.name}
            </span>
            <span className="text-sm font-bold text-[#111111]">
              {formatPrice(selectedPack.price)}
            </span>
          </div>

          <button
            type="button"
            onClick={handleAddToCart}
            className="flex-1 max-w-[200px] flex items-center justify-center gap-2 bg-[#111111] text-[#FFFFFF] py-2.5 px-4 rounded-full text-xs uppercase tracking-[0.14em] font-medium"
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            <span>Add to Cart</span>
          </button>
        </div>
      </main>

      <Footer />
    </div>
  );
}
