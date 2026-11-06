"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
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
  Sparkles,
  RefreshCw,
  Clock,
  Heart,
} from "lucide-react";
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
    setTimeout(() => setAddedNotice(false), 2500);
  };

  const handleBuyNow = () => {
    addItem(selectedPack, quantity);
    router.push("/checkout");
  };

  const accordionItems = [
    {
      id: "details-overview",
      title: "Detailed Formula Overview",
      content: (
        <div className="space-y-3">
          <p className="text-xs leading-relaxed text-[#575D52]">
            {PRODUCT_CONFIG.fullDescription}
          </p>
          <div className="grid grid-cols-2 gap-3 pt-2">
            {PRODUCT_CONFIG.specifications.map((spec, idx) => (
              <div key={idx} className="bg-[#EEEBDD]/60 p-2.5 rounded-lg border border-[#E6E1D3]">
                <span className="text-[10px] uppercase tracking-wider text-[#A9B9A0] block font-semibold">
                  {spec.label}
                </span>
                <span className="text-xs font-medium text-[#173D32]">
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
      title: "Provisional Ingredients Declaration",
      content: (
        <div className="space-y-4">
          <div className="p-3 bg-[#EEEBDD] rounded-xl text-xs text-[#575D52] border border-[#E6E1D3]">
            <span className="font-semibold text-[#173D32] block mb-1">
              Manufacturer Transparency Notice:
            </span>
            {PRODUCT_CONFIG.ingredientsNote}
          </div>
          <div className="space-y-3">
            {PRODUCT_CONFIG.provisionalIngredients.map((cat, idx) => (
              <div key={idx} className="border-b border-[#E6E1D3]/70 pb-3 last:border-b-0">
                <span className="text-xs font-semibold text-[#173D32] block">
                  {cat.category}
                </span>
                <span className="text-xs text-[#575D52] block mt-0.5">
                  {cat.items.join(" · ")}
                </span>
                <span className="text-[11px] text-[#A9B9A0] block italic mt-1">
                  Physiological role: {cat.purpose}
                </span>
              </div>
            ))}
          </div>
        </div>
      ),
    },
    {
      id: "details-directions",
      title: "Daily Morning Ritual & Directions",
      content: (
        <div className="space-y-3">
          {PRODUCT_CONFIG.directions.map((step, idx) => (
            <div key={idx} className="flex gap-3 text-xs">
              <span className="w-6 h-6 rounded-full bg-[#173D32] text-[#F8F6EF] flex items-center justify-center text-[10px] font-semibold shrink-0">
                {idx + 1}
              </span>
              <div>
                <span className="font-semibold text-[#173D32] block">
                  {step.step}
                </span>
                <span className="text-[#575D52] leading-relaxed">
                  {step.instruction}
                </span>
              </div>
            </div>
          ))}
          <p className="text-[11px] text-[#575D52] pt-2 italic">
            Best consumed consistently each morning with 200–250ml room-temperature water.
          </p>
        </div>
      ),
    },
    {
      id: "details-safety",
      title: "Safety, Suitability & Precautions",
      content: (
        <div className="space-y-2 text-xs text-[#575D52]">
          <ul className="list-disc list-inside space-y-1.5">
            {PRODUCT_CONFIG.safetyInformation.map((info, idx) => (
              <li key={idx} className="leading-relaxed">
                {info}
              </li>
            ))}
          </ul>
          <div className="mt-3 p-3 bg-[#EEEBDD]/70 rounded-lg border border-[#E6E1D3]">
            <span className="font-semibold text-[#173D32] block mb-0.5">
              Storage Instructions:
            </span>
            <p className="text-[11px]">{PRODUCT_CONFIG.storageInstructions}</p>
          </div>
        </div>
      ),
    },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-[#F8F6EF]">
      <AnnouncementBar />
      <Header />

      <main className="flex-grow py-10 lg:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Breadcrumb */}
          <nav className="text-xs text-[#575D52] mb-8 flex items-center gap-2">
            <Link href="/" className="hover:text-[#173D32] transition-colors">
              Home
            </Link>
            <span>/</span>
            <span className="text-[#173D32] font-medium">Flagship Product</span>
          </nav>

          {/* Product Primary Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16">
            {/* Left Column: Gallery & Detail Closeups */}
            <div className="lg:col-span-7 space-y-4">
              {/* Active Image */}
              <div className="relative aspect-square sm:aspect-[4/3] rounded-3xl overflow-hidden bg-[#EEEBDD] border border-[#E6E1D3] shadow-sm">
                <Image
                  src={PRODUCT_CONFIG.images[selectedImageIndex]?.src || "/images/product-jar-hero.jpg"}
                  alt={PRODUCT_CONFIG.images[selectedImageIndex]?.alt || PRODUCT_CONFIG.name}
                  fill
                  priority
                  sizes="(max-width: 1024px) 100vw, 650px"
                  className="object-cover object-center"
                />

                {selectedPack.badge && (
                  <div className="absolute top-4 left-4 bg-[#173D32] text-[#F8F6EF] text-[10px] tracking-[0.16em] uppercase px-3 py-1.5 rounded-full font-medium shadow-sm">
                    {selectedPack.badge}
                  </div>
                )}
              </div>

              {/* Thumbnails */}
              <div className="grid grid-cols-4 gap-3 sm:gap-4">
                {PRODUCT_CONFIG.images.map((img, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setSelectedImageIndex(idx)}
                    className={`relative aspect-square rounded-xl overflow-hidden bg-[#EEEBDD] border-2 transition-all ${
                      selectedImageIndex === idx
                        ? "border-[#173D32] ring-2 ring-[#173D32]/20"
                        : "border-transparent opacity-75 hover:opacity-100"
                    }`}
                    aria-label={`View ${img.label}`}
                  >
                    <Image
                      src={img.src}
                      alt={img.alt}
                      fill
                      sizes="140px"
                      className="object-cover object-center"
                    />
                  </button>
                ))}
              </div>

              {/* Editorial Quality Promises */}
              <div className="grid grid-cols-3 gap-4 pt-6">
                <div className="p-4 rounded-2xl bg-[#EEEBDD]/40 border border-[#E6E1D3] text-center">
                  <Leaf className="w-5 h-5 text-[#7D9273] mx-auto mb-1.5" />
                  <p className="text-xs font-serif font-medium text-[#173D32]">
                    Clean Botanicals
                  </p>
                  <p className="text-[10px] text-[#575D52] mt-0.5">
                    Non-GMO & Vegan
                  </p>
                </div>
                <div className="p-4 rounded-2xl bg-[#EEEBDD]/40 border border-[#E6E1D3] text-center">
                  <ShieldCheck className="w-5 h-5 text-[#7D9273] mx-auto mb-1.5" />
                  <p className="text-xs font-serif font-medium text-[#173D32]">
                    Verified Purity
                  </p>
                  <p className="text-[10px] text-[#575D52] mt-0.5">
                    ISO & GMP Standards
                  </p>
                </div>
                <div className="p-4 rounded-2xl bg-[#EEEBDD]/40 border border-[#E6E1D3] text-center">
                  <RefreshCw className="w-5 h-5 text-[#7D9273] mx-auto mb-1.5" />
                  <p className="text-xs font-serif font-medium text-[#173D32]">
                    Glass Packaging
                  </p>
                  <p className="text-[10px] text-[#575D52] mt-0.5">
                    100% Recyclable UV Jar
                  </p>
                </div>
              </div>
            </div>

            {/* Right Column: Commercial Actions */}
            <div className="lg:col-span-5 space-y-6">
              <div>
                <span className="text-[11px] uppercase tracking-[0.2em] font-semibold text-[#B99A63]">
                  {PRODUCT_CONFIG.category}
                </span>
                <h1 className="text-3xl sm:text-4xl font-serif text-[#173D32] mt-1">
                  {PRODUCT_CONFIG.name}
                </h1>
                <p className="text-xs text-[#575D52] italic mt-1">
                  {PRODUCT_CONFIG.tagline}
                </p>
              </div>

              {/* Price */}
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
                  All Taxes Included · Free Delivery
                </span>
              </div>

              <p className="text-sm text-[#575D52] leading-relaxed">
                {PRODUCT_CONFIG.shortDescription}
              </p>

              {/* Pack Selector */}
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <label className="text-xs uppercase tracking-[0.16em] font-semibold text-[#173D32]">
                    Select Ritual Duration
                  </label>
                  <span className="text-xs text-[#B99A63] font-medium">
                    {selectedPack.servings} Servings Total
                  </span>
                </div>

                <div className="space-y-2.5">
                  {PRODUCT_CONFIG.packOptions.map((pack) => {
                    const isSelected = selectedPack.id === pack.id;
                    return (
                      <button
                        key={pack.id}
                        type="button"
                        onClick={() => setSelectedPack(pack)}
                        className={`w-full text-left p-4 rounded-2xl border transition-all flex items-center justify-between ${
                          isSelected
                            ? "border-[#173D32] bg-[#EEEBDD]/70 ring-1 ring-[#173D32]/20"
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
                            {isSelected && (
                              <div className="w-1.5 h-1.5 bg-[#F8F6EF] rounded-full" />
                            )}
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

              {/* Quantity Stepper & Add to Cart */}
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

              {/* Delivery checker */}
              <div className="pt-2">
                <PincodeChecker />
              </div>

              {/* Accordion Tabs */}
              <div className="pt-4">
                <Accordion items={accordionItems} defaultOpenId="details-overview" />
              </div>
            </div>
          </div>

          {/* Deep-Dive Scientific Details Section Below */}
          <div className="mt-24 pt-16 border-t border-[#E6E1D3]">
            <div className="max-w-3xl mx-auto space-y-12">
              <div className="text-center space-y-3">
                <span className="text-[11px] font-semibold tracking-[0.22em] uppercase text-[#173D32]">
                  FORMULATION PERSPECTIVE
                </span>
                <h2 className="text-3xl font-serif text-[#173D32]">
                  Designed for Gentle, Compounding Balance
                </h2>
                <p className="text-sm text-[#575D52] leading-relaxed">
                  We built GutGlow Daily Wellness Formula around long-term physiological
                  sustainability rather than short-term harsh cathartics.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-6 bg-[#EEEBDD]/50 rounded-2xl border border-[#E6E1D3] space-y-2">
                  <h4 className="text-base font-serif text-[#173D32]">
                    Prebiotic Fuel Matrix
                  </h4>
                  <p className="text-xs text-[#575D52] leading-relaxed">
                    Fermentable soluble fibers that feed native Bifidobacteria and
                    Lactobacilli species without causing sudden, distressful gas or
                    bloating.
                  </p>
                </div>

                <div className="p-6 bg-[#EEEBDD]/50 rounded-2xl border border-[#E6E1D3] space-y-2">
                  <h4 className="text-base font-serif text-[#173D32]">
                    Botanical Mucilage & Calming Actives
                  </h4>
                  <p className="text-xs text-[#575D52] leading-relaxed">
                    Traditional ginger rhizome and soothing peppermint extracts
                    support smooth upper gastrointestinal transit and digestive ease.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Sticky Mobile Add to Cart Bar */}
        <div className="lg:hidden fixed bottom-0 inset-x-0 bg-[#F8F6EF]/95 backdrop-blur-md border-t border-[#E6E1D3] p-4 z-30 shadow-lg flex items-center justify-between gap-4">
          <div>
            <span className="text-[11px] text-[#575D52] block line-clamp-1">
              {selectedPack.name}
            </span>
            <span className="text-base font-serif font-medium text-[#173D32]">
              {formatPrice(selectedPack.price)}
            </span>
          </div>

          <button
            type="button"
            onClick={handleAddToCart}
            className="flex-1 max-w-[220px] flex items-center justify-center gap-2 bg-[#173D32] text-[#F8F6EF] py-3 px-4 rounded-full text-xs uppercase tracking-[0.16em] font-medium shadow"
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            <span>Add to Bag</span>
          </button>
        </div>
      </main>

      <Footer />
    </div>
  );
}
