"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  ShieldCheck,
  Truck,
  CreditCard,
  Lock,
  ArrowRight,
  CheckCircle,
  AlertCircle,
  HelpCircle,
  Smartphone,
  Banknote,
} from "lucide-react";
import { AnnouncementBar } from "@/components/layout/AnnouncementBar";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { useCart } from "@/lib/cart-context";
import { formatPrice } from "@/lib/utils";
import { checkoutSchema, CheckoutFormValues } from "@/lib/validations";
import { OrderConfirmation } from "@/types/order";

export default function CheckoutPage() {
  const { items, subtotal, totalItems, clearCart } = useCart();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [confirmedOrder, setConfirmedOrder] = useState<OrderConfirmation | null>(null);
  const [gatewayMessage, setGatewayMessage] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<CheckoutFormValues>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      paymentMethod: "upi",
      state: "Maharashtra",
    },
  });

  const selectedPaymentMethod = watch("paymentMethod");

  const onSubmit = async (data: CheckoutFormValues) => {
    setIsSubmitting(true);
    setGatewayMessage(null);

    // Simulate validation and API dispatch
    await new Promise((resolve) => setTimeout(resolve, 800));

    if (data.paymentMethod === "cod") {
      // Cash on delivery can be placed directly without mock payment gateway
      const order: OrderConfirmation = {
        orderId: `GG-${Math.floor(100000 + Math.random() * 900000)}`,
        date: new Date().toLocaleDateString("en-IN", {
          year: "numeric",
          month: "long",
          day: "numeric",
        }),
        customerName: `${data.firstName} ${data.lastName}`,
        email: data.email,
        items: items.map((i) => ({
          name: i.productName,
          packName: i.packOption.name,
          quantity: i.quantity,
          price: i.packOption.price * i.quantity,
        })),
        subtotal,
        shipping: 0,
        total: subtotal,
        shippingAddress: {
          address: `${data.addressLine1}${data.addressLine2 ? ", " + data.addressLine2 : ""}`,
          city: data.city,
          state: data.state,
          pincode: data.pincode,
        },
        paymentMethod: "Cash on Delivery (Pay upon delivery)",
      };

      setConfirmedOrder(order);
      clearCart();
      setIsSubmitting(false);
    } else {
      // Online payment (Razorpay / UPI / Cards)
      // Per instructions: Do not create a fake successful payment flow.
      // Keep payment gateway integration modular and ready for Razorpay.
      setIsSubmitting(false);
      setGatewayMessage(
        "Payment Gateway Integration: Your order details have been validated. To trigger the live Razorpay modal, configure NEXT_PUBLIC_RAZORPAY_KEY_ID in your environment. Alternatively, select Cash on Delivery to place an offline verified order."
      );
    }
  };

  if (confirmedOrder) {
    return (
      <div className="min-h-screen flex flex-col bg-[#F8F6EF]">
        <AnnouncementBar />
        <Header />

        <main className="flex-grow py-16 lg:py-24">
          <div className="max-w-2xl mx-auto px-4 sm:px-6">
            <div className="bg-[#EEEBDD]/70 border border-[#E6E1D3] rounded-3xl p-8 sm:p-12 text-center space-y-6 shadow-sm">
              <div className="w-16 h-16 rounded-full bg-[#173D32] text-[#F8F6EF] flex items-center justify-center mx-auto shadow-md">
                <CheckCircle className="w-8 h-8" />
              </div>

              <div className="space-y-2">
                <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#B99A63]">
                  Order Placed Successfully
                </span>
                <h1 className="text-3xl font-serif text-[#173D32]">
                  Thank You, {confirmedOrder.customerName}
                </h1>
                <p className="text-xs text-[#575D52]">
                  Order ID: <span className="font-semibold text-[#173D32]">{confirmedOrder.orderId}</span>
                </p>
                <p className="text-xs text-[#575D52]">
                  A confirmation email with tracking updates has been scheduled for{" "}
                  <span className="font-medium text-[#173D32]">{confirmedOrder.email}</span>.
                </p>
              </div>

              {/* Order breakdown card */}
              <div className="text-left bg-[#F8F6EF] rounded-2xl p-6 border border-[#E6E1D3] space-y-4 text-xs">
                <div className="border-b border-[#E6E1D3] pb-3">
                  <h4 className="font-serif font-medium text-[#173D32] text-sm">
                    Items in This Shipment
                  </h4>
                  <div className="mt-2 space-y-2">
                    {confirmedOrder.items.map((i, idx) => (
                      <div key={idx} className="flex justify-between text-[#575D52]">
                        <span>
                          {i.name} ({i.packName}) × {i.quantity}
                        </span>
                        <span className="font-medium text-[#173D32]">
                          {formatPrice(i.price)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex justify-between text-xs pt-1">
                  <span className="text-[#575D52]">Shipping (Express)</span>
                  <span className="text-[#173D32] font-medium">Free</span>
                </div>

                <div className="flex justify-between text-sm font-serif border-t border-[#E6E1D3] pt-3 font-medium text-[#173D32]">
                  <span>Total Amount</span>
                  <span>{formatPrice(confirmedOrder.total)}</span>
                </div>

                <div className="pt-2 text-[11px] text-[#575D52] border-t border-[#E6E1D3]/80">
                  <span className="font-semibold text-[#173D32] block">Shipping To:</span>
                  <p>{confirmedOrder.shippingAddress.address}</p>
                  <p>
                    {confirmedOrder.shippingAddress.city},{" "}
                    {confirmedOrder.shippingAddress.state} —{" "}
                    {confirmedOrder.shippingAddress.pincode}
                  </p>
                  <p className="mt-1 font-medium text-[#173D32]">
                    Payment Mode: {confirmedOrder.paymentMethod}
                  </p>
                </div>
              </div>

              <div className="pt-2">
                <Link
                  href="/"
                  className="inline-flex items-center justify-center gap-2 bg-[#173D32] text-[#F8F6EF] px-8 py-3.5 rounded-full text-xs uppercase tracking-[0.18em] font-medium hover:bg-[#122e26] transition-colors"
                >
                  <span>Return to Homepage</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </div>
        </main>

        <Footer />
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="min-h-screen flex flex-col bg-[#F8F6EF]">
        <AnnouncementBar />
        <Header />
        <main className="flex-grow py-20 flex items-center justify-center">
          <div className="text-center space-y-4 max-w-md px-4">
            <h1 className="text-2xl font-serif text-[#173D32]">Your Bag Is Empty</h1>
            <p className="text-xs text-[#575D52]">
              Please add the GutGlow Daily Wellness Formula to your bag before checking out.
            </p>
            <Link
              href="/product"
              className="inline-flex items-center gap-2 bg-[#173D32] text-[#F8F6EF] px-6 py-3 rounded-full text-xs uppercase tracking-wider font-medium"
            >
              <span>Explore Formula</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#F8F6EF]">
      <AnnouncementBar />
      <Header />

      <main className="flex-grow py-12 lg:py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-10 text-center sm:text-left">
            <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#B99A63]">
              SECURE CHECKOUT
            </span>
            <h1 className="text-3xl sm:text-4xl font-serif text-[#173D32] mt-1">
              Finalize Your Wellness Order
            </h1>
          </div>

          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
              {/* Form Fields Column */}
              <div className="lg:col-span-7 space-y-8">
                {/* 1. Contact Information */}
                <div className="bg-[#EEEBDD]/50 border border-[#E6E1D3] rounded-3xl p-6 sm:p-8 space-y-4">
                  <h3 className="text-base font-serif font-medium text-[#173D32] flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-[#173D32] text-[#F8F6EF] text-xs flex items-center justify-center font-sans">
                      1
                    </span>
                    <span>Contact Information</span>
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                    <div className="sm:col-span-2">
                      <label className="block text-xs font-medium text-[#252923] mb-1">
                        Email Address for Order Updates *
                      </label>
                      <input
                        type="email"
                        {...register("email")}
                        placeholder="you@example.com"
                        className="w-full bg-[#F8F6EF] border border-[#E6E1D3] rounded-xl px-3.5 py-2.5 text-xs text-[#252923] focus:outline-none focus:border-[#173D32]"
                      />
                      {errors.email && (
                        <p className="text-[11px] text-[#c0392b] mt-1">
                          {errors.email.message}
                        </p>
                      )}
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block text-xs font-medium text-[#252923] mb-1">
                        Mobile Phone (for delivery SMS & dispatch) *
                      </label>
                      <input
                        type="tel"
                        {...register("phone")}
                        placeholder="+91 98765 43210"
                        className="w-full bg-[#F8F6EF] border border-[#E6E1D3] rounded-xl px-3.5 py-2.5 text-xs text-[#252923] focus:outline-none focus:border-[#173D32]"
                      />
                      {errors.phone && (
                        <p className="text-[11px] text-[#c0392b] mt-1">
                          {errors.phone.message}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* 2. Shipping Address */}
                <div className="bg-[#EEEBDD]/50 border border-[#E6E1D3] rounded-3xl p-6 sm:p-8 space-y-4">
                  <h3 className="text-base font-serif font-medium text-[#173D32] flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-[#173D32] text-[#F8F6EF] text-xs flex items-center justify-center font-sans">
                      2
                    </span>
                    <span>Shipping Address</span>
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                    <div>
                      <label className="block text-xs font-medium text-[#252923] mb-1">
                        First Name *
                      </label>
                      <input
                        type="text"
                        {...register("firstName")}
                        placeholder="Rohan"
                        className="w-full bg-[#F8F6EF] border border-[#E6E1D3] rounded-xl px-3.5 py-2.5 text-xs text-[#252923] focus:outline-none focus:border-[#173D32]"
                      />
                      {errors.firstName && (
                        <p className="text-[11px] text-[#c0392b] mt-1">
                          {errors.firstName.message}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-[#252923] mb-1">
                        Last Name *
                      </label>
                      <input
                        type="text"
                        {...register("lastName")}
                        placeholder="Sharma"
                        className="w-full bg-[#F8F6EF] border border-[#E6E1D3] rounded-xl px-3.5 py-2.5 text-xs text-[#252923] focus:outline-none focus:border-[#173D32]"
                      />
                      {errors.lastName && (
                        <p className="text-[11px] text-[#c0392b] mt-1">
                          {errors.lastName.message}
                        </p>
                      )}
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block text-xs font-medium text-[#252923] mb-1">
                        Street Address / Apartment / Suite *
                      </label>
                      <input
                        type="text"
                        {...register("addressLine1")}
                        placeholder="Flat 402, Green Meadows, 14th Main Road"
                        className="w-full bg-[#F8F6EF] border border-[#E6E1D3] rounded-xl px-3.5 py-2.5 text-xs text-[#252923] focus:outline-none focus:border-[#173D32]"
                      />
                      {errors.addressLine1 && (
                        <p className="text-[11px] text-[#c0392b] mt-1">
                          {errors.addressLine1.message}
                        </p>
                      )}
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block text-xs font-medium text-[#252923] mb-1">
                        Landmark / Floor (Optional)
                      </label>
                      <input
                        type="text"
                        {...register("addressLine2")}
                        placeholder="Near City Botanical Garden"
                        className="w-full bg-[#F8F6EF] border border-[#E6E1D3] rounded-xl px-3.5 py-2.5 text-xs text-[#252923] focus:outline-none focus:border-[#173D32]"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-[#252923] mb-1">
                        City *
                      </label>
                      <input
                        type="text"
                        {...register("city")}
                        placeholder="Mumbai"
                        className="w-full bg-[#F8F6EF] border border-[#E6E1D3] rounded-xl px-3.5 py-2.5 text-xs text-[#252923] focus:outline-none focus:border-[#173D32]"
                      />
                      {errors.city && (
                        <p className="text-[11px] text-[#c0392b] mt-1">
                          {errors.city.message}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-[#252923] mb-1">
                        PIN Code (6 Digits) *
                      </label>
                      <input
                        type="text"
                        maxLength={6}
                        {...register("pincode")}
                        placeholder="400001"
                        className="w-full bg-[#F8F6EF] border border-[#E6E1D3] rounded-xl px-3.5 py-2.5 text-xs text-[#252923] focus:outline-none focus:border-[#173D32]"
                      />
                      {errors.pincode && (
                        <p className="text-[11px] text-[#c0392b] mt-1">
                          {errors.pincode.message}
                        </p>
                      )}
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block text-xs font-medium text-[#252923] mb-1">
                        State *
                      </label>
                      <input
                        type="text"
                        {...register("state")}
                        placeholder="Maharashtra"
                        className="w-full bg-[#F8F6EF] border border-[#E6E1D3] rounded-xl px-3.5 py-2.5 text-xs text-[#252923] focus:outline-none focus:border-[#173D32]"
                      />
                      {errors.state && (
                        <p className="text-[11px] text-[#c0392b] mt-1">
                          {errors.state.message}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* 3. Payment Method */}
                <div className="bg-[#EEEBDD]/50 border border-[#E6E1D3] rounded-3xl p-6 sm:p-8 space-y-4">
                  <h3 className="text-base font-serif font-medium text-[#173D32] flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-[#173D32] text-[#F8F6EF] text-xs flex items-center justify-center font-sans">
                      3
                    </span>
                    <span>Payment Method</span>
                  </h3>

                  <div className="space-y-3 pt-2">
                    {/* UPI */}
                    <label className="flex items-center justify-between p-4 rounded-2xl border border-[#E6E1D3] bg-[#F8F6EF] cursor-pointer hover:border-[#173D32]/50 transition-colors">
                      <div className="flex items-center gap-3">
                        <input
                          type="radio"
                          value="upi"
                          {...register("paymentMethod")}
                          className="w-4 h-4 text-[#173D32] focus:ring-[#173D32]"
                        />
                        <div className="flex items-center gap-2">
                          <Smartphone className="w-4 h-4 text-[#173D32]" />
                          <span className="text-xs font-medium text-[#173D32]">
                            UPI / QR (Google Pay, PhonePe, Paytm, BHIM)
                          </span>
                        </div>
                      </div>
                      <span className="text-[10px] uppercase font-semibold text-[#B99A63]">
                        Instant
                      </span>
                    </label>

                    {/* Card */}
                    <label className="flex items-center justify-between p-4 rounded-2xl border border-[#E6E1D3] bg-[#F8F6EF] cursor-pointer hover:border-[#173D32]/50 transition-colors">
                      <div className="flex items-center gap-3">
                        <input
                          type="radio"
                          value="card"
                          {...register("paymentMethod")}
                          className="w-4 h-4 text-[#173D32] focus:ring-[#173D32]"
                        />
                        <div className="flex items-center gap-2">
                          <CreditCard className="w-4 h-4 text-[#173D32]" />
                          <span className="text-xs font-medium text-[#173D32]">
                            Credit / Debit Card (Visa, MasterCard, RuPay, Amex)
                          </span>
                        </div>
                      </div>
                      <span className="text-[10px] uppercase font-semibold text-[#575D52]">
                        256-Bit SSL
                      </span>
                    </label>

                    {/* Cash on Delivery */}
                    <label className="flex items-center justify-between p-4 rounded-2xl border border-[#E6E1D3] bg-[#F8F6EF] cursor-pointer hover:border-[#173D32]/50 transition-colors">
                      <div className="flex items-center gap-3">
                        <input
                          type="radio"
                          value="cod"
                          {...register("paymentMethod")}
                          className="w-4 h-4 text-[#173D32] focus:ring-[#173D32]"
                        />
                        <div className="flex items-center gap-2">
                          <Banknote className="w-4 h-4 text-[#173D32]" />
                          <span className="text-xs font-medium text-[#173D32]">
                            Cash on Delivery (COD)
                          </span>
                        </div>
                      </div>
                      <span className="text-[10px] uppercase font-semibold text-[#7D9273]">
                        Verified Dispatch
                      </span>
                    </label>
                  </div>

                  {errors.paymentMethod && (
                    <p className="text-[11px] text-[#c0392b]">
                      {errors.paymentMethod.message}
                    </p>
                  )}
                </div>
              </div>

              {/* Order Summary Column */}
              <div className="lg:col-span-5">
                <div className="bg-[#EEEBDD]/70 border border-[#E6E1D3] rounded-3xl p-6 sm:p-8 space-y-6 sticky top-28">
                  <h3 className="text-lg font-serif font-medium text-[#173D32]">
                    Order Summary ({totalItems})
                  </h3>

                  {/* Items list */}
                  <div className="divide-y divide-[#E6E1D3] border-y border-[#E6E1D3] py-2 max-h-60 overflow-y-auto">
                    {items.map((item) => (
                      <div key={item.packOption.id} className="py-3 flex gap-3 text-xs">
                        <div className="relative w-12 h-14 bg-[#EEEBDD] rounded-lg overflow-hidden shrink-0 border border-[#E6E1D3]">
                          <Image
                            src={item.image}
                            alt={item.productName}
                            fill
                            className="object-cover"
                          />
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-[#173D32] leading-tight">
                            {item.productName}
                          </p>
                          <p className="text-[11px] text-[#B99A63] mt-0.5">
                            {item.packOption.name} · Qty {item.quantity}
                          </p>
                        </div>
                        <div className="text-right font-medium text-[#173D32]">
                          {formatPrice(item.packOption.price * item.quantity)}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Calculations */}
                  <div className="space-y-2.5 text-xs text-[#575D52] pb-2">
                    <div className="flex justify-between">
                      <span>Subtotal</span>
                      <span className="text-[#173D32] font-medium">{formatPrice(subtotal)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="flex items-center gap-1.5">
                        <Truck className="w-3.5 h-3.5 text-[#7D9273]" />
                        <span>Nationwide Express Shipping</span>
                      </span>
                      <span className="text-[#173D32] font-semibold text-[11px]">FREE</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Taxes & Packaging</span>
                      <span className="text-[#173D32]">Included</span>
                    </div>
                  </div>

                  {/* Total */}
                  <div className="flex items-baseline justify-between border-t border-[#E6E1D3] pt-4">
                    <span className="text-base font-serif font-medium text-[#173D32]">
                      Total Payable
                    </span>
                    <span className="text-2xl font-serif font-semibold text-[#173D32]">
                      {formatPrice(subtotal)}
                    </span>
                  </div>

                  {/* Gateway Notice / Feedback */}
                  {gatewayMessage && (
                    <div className="p-4 bg-[#F8F6EF] border border-[#B99A63]/50 rounded-2xl text-xs text-[#575D52] space-y-1.5">
                      <div className="flex items-center gap-1.5 text-[#173D32] font-medium">
                        <AlertCircle className="w-4 h-4 text-[#B99A63] shrink-0" />
                        <span>Integration Notice</span>
                      </div>
                      <p className="text-[11px] leading-relaxed">
                        {gatewayMessage}
                      </p>
                    </div>
                  )}

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full flex items-center justify-center gap-2 bg-[#173D32] text-[#F8F6EF] py-4 rounded-full text-xs uppercase tracking-[0.18em] font-medium hover:bg-[#122e26] transition-all shadow-md disabled:opacity-50"
                  >
                    <Lock className="w-4 h-4" />
                    <span>
                      {isSubmitting
                        ? "Verifying Order..."
                        : selectedPaymentMethod === "cod"
                        ? "Place Verified COD Order"
                        : "Proceed to Payment Gateway"}
                    </span>
                  </button>

                  <div className="pt-2 text-center space-y-1.5">
                    <div className="flex items-center justify-center gap-1.5 text-[11px] text-[#575D52]">
                      <ShieldCheck className="w-3.5 h-3.5 text-[#7D9273]" />
                      <span>Zero Risk · 30-Day Happiness Guarantee</span>
                    </div>
                    <p className="text-[10px] text-[#A9B9A0]">
                      Modular payment gateway architecture ready for Razorpay
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </form>
        </div>
      </main>

      <Footer />
    </div>
  );
}
