"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  CreditCard,
  Lock,
  ArrowRight,
  CheckCircle,
  AlertCircle,
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

    await new Promise((resolve) => setTimeout(resolve, 600));

    if (data.paymentMethod === "cod") {
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
        paymentMethod: "Cash on Delivery",
      };

      setConfirmedOrder(order);
      clearCart();
      setIsSubmitting(false);
    } else {
      setIsSubmitting(false);
      setGatewayMessage(
        "Payment Gateway Integration: Your order details are validated. To trigger the live payment modal, configure NEXT_PUBLIC_RAZORPAY_KEY_ID in your environment. Alternatively, select Cash on Delivery to place an offline verified order."
      );
    }
  };

  if (confirmedOrder) {
    return (
      <div className="min-h-screen flex flex-col bg-[#FFFFFF]">
        <AnnouncementBar />
        <Header />

        <main className="flex-grow py-16 lg:py-24">
          <div className="max-w-xl mx-auto px-4 sm:px-6">
            <div className="bg-[#F5F5F5] border border-[#E5E5E5] rounded-2xl p-8 sm:p-10 text-center space-y-6">
              <div className="w-12 h-12 rounded-full bg-[#111111] text-[#FFFFFF] flex items-center justify-center mx-auto">
                <CheckCircle className="w-6 h-6" />
              </div>

              <div className="space-y-1">
                <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#666666]">
                  Order Confirmed
                </span>
                <h1 className="text-2xl sm:text-3xl font-bold text-[#111111]">
                  Thank You, {confirmedOrder.customerName}
                </h1>
                <p className="text-xs text-[#666666]">
                  Order ID: <span className="font-semibold text-[#111111]">{confirmedOrder.orderId}</span>
                </p>
              </div>

              <div className="text-left bg-[#FFFFFF] rounded-xl p-5 border border-[#E5E5E5] space-y-3 text-xs">
                <div className="border-b border-[#E5E5E5] pb-3">
                  <h4 className="font-semibold text-[#111111] mb-2">Order Items</h4>
                  {confirmedOrder.items.map((i, idx) => (
                    <div key={idx} className="flex justify-between text-[#666666] py-0.5">
                      <span>{i.name} ({i.packName}) × {i.quantity}</span>
                      <span className="font-medium text-[#111111]">{formatPrice(i.price)}</span>
                    </div>
                  ))}
                </div>

                <div className="flex justify-between font-bold text-sm pt-1 text-[#111111]">
                  <span>Total Amount</span>
                  <span>{formatPrice(confirmedOrder.total)}</span>
                </div>

                <div className="pt-2 text-[11px] text-[#666666] border-t border-[#E5E5E5]">
                  <span className="font-semibold text-[#111111] block">Delivery Address:</span>
                  <p>{confirmedOrder.shippingAddress.address}, {confirmedOrder.shippingAddress.city}, {confirmedOrder.shippingAddress.state} — {confirmedOrder.shippingAddress.pincode}</p>
                </div>
              </div>

              <div>
                <Link
                  href="/"
                  className="inline-flex items-center justify-center gap-2 bg-[#111111] text-[#FFFFFF] px-6 py-3 rounded-lg text-xs uppercase tracking-[0.16em] font-medium hover:bg-[#333333] transition-colors"
                >
                  <span>Return to Home</span>
                  <ArrowRight className="w-3.5 h-3.5" />
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
      <div className="min-h-screen flex flex-col bg-[#FFFFFF]">
        <AnnouncementBar />
        <Header />
        <main className="flex-grow py-20 flex items-center justify-center">
          <div className="text-center space-y-4 max-w-md px-4">
            <h1 className="text-2xl font-bold text-[#111111]">Your Bag Is Empty</h1>
            <p className="text-xs text-[#666666]">
              Please add GutGlow Daily Wellness Formula to your bag before checking out.
            </p>
            <Link
              href="/product"
              className="inline-flex items-center gap-2 bg-[#111111] text-[#FFFFFF] px-6 py-3 rounded-lg text-xs uppercase tracking-wider font-medium hover:bg-[#333333] transition-colors"
            >
              <span>Explore Formula</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#FFFFFF]">
      <AnnouncementBar />
      <Header />

      <main className="flex-grow py-12 lg:py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-10 text-center sm:text-left">
            <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#666666]">
              CHECKOUT
            </span>
            <h1 className="text-3xl font-bold text-[#111111] mt-1">
              Finalize Your Order
            </h1>
          </div>

          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
              {/* Form Fields */}
              <div className="lg:col-span-7 space-y-6">
                {/* 1. Contact Information */}
                <div className="bg-[#F5F5F5] border border-[#E5E5E5] rounded-2xl p-6 sm:p-7 space-y-4">
                  <h3 className="text-sm font-bold text-[#111111] flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-[#111111] text-[#FFFFFF] text-[10px] flex items-center justify-center font-sans font-bold">
                      1
                    </span>
                    <span>Contact Information</span>
                  </h3>

                  <div className="space-y-3 pt-1">
                    <div>
                      <label className="block text-xs font-semibold text-[#111111] mb-1">
                        Email Address *
                      </label>
                      <input
                        type="email"
                        {...register("email")}
                        placeholder="name@example.com"
                        className="w-full bg-[#FFFFFF] border border-[#E5E5E5] rounded-lg px-3.5 py-2.5 text-xs text-[#111111] focus:outline-none focus:border-[#111111]"
                      />
                      {errors.email && (
                        <p className="text-[11px] text-[#c0392b] mt-1">{errors.email.message}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-[#111111] mb-1">
                        Phone Number *
                      </label>
                      <input
                        type="tel"
                        {...register("phone")}
                        placeholder="+91 98765 43210"
                        className="w-full bg-[#FFFFFF] border border-[#E5E5E5] rounded-lg px-3.5 py-2.5 text-xs text-[#111111] focus:outline-none focus:border-[#111111]"
                      />
                      {errors.phone && (
                        <p className="text-[11px] text-[#c0392b] mt-1">{errors.phone.message}</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* 2. Shipping Address */}
                <div className="bg-[#F5F5F5] border border-[#E5E5E5] rounded-2xl p-6 sm:p-7 space-y-4">
                  <h3 className="text-sm font-bold text-[#111111] flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-[#111111] text-[#FFFFFF] text-[10px] flex items-center justify-center font-sans font-bold">
                      2
                    </span>
                    <span>Shipping Address</span>
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                    <div>
                      <label className="block text-xs font-semibold text-[#111111] mb-1">
                        First Name *
                      </label>
                      <input
                        type="text"
                        {...register("firstName")}
                        placeholder="First Name"
                        className="w-full bg-[#FFFFFF] border border-[#E5E5E5] rounded-lg px-3.5 py-2.5 text-xs text-[#111111] focus:outline-none focus:border-[#111111]"
                      />
                      {errors.firstName && (
                        <p className="text-[11px] text-[#c0392b] mt-1">{errors.firstName.message}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-[#111111] mb-1">
                        Last Name *
                      </label>
                      <input
                        type="text"
                        {...register("lastName")}
                        placeholder="Last Name"
                        className="w-full bg-[#FFFFFF] border border-[#E5E5E5] rounded-lg px-3.5 py-2.5 text-xs text-[#111111] focus:outline-none focus:border-[#111111]"
                      />
                      {errors.lastName && (
                        <p className="text-[11px] text-[#c0392b] mt-1">{errors.lastName.message}</p>
                      )}
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block text-xs font-semibold text-[#111111] mb-1">
                        Street Address *
                      </label>
                      <input
                        type="text"
                        {...register("addressLine1")}
                        placeholder="House / Flat / Street address"
                        className="w-full bg-[#FFFFFF] border border-[#E5E5E5] rounded-lg px-3.5 py-2.5 text-xs text-[#111111] focus:outline-none focus:border-[#111111]"
                      />
                      {errors.addressLine1 && (
                        <p className="text-[11px] text-[#c0392b] mt-1">{errors.addressLine1.message}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-[#111111] mb-1">
                        City *
                      </label>
                      <input
                        type="text"
                        {...register("city")}
                        placeholder="City"
                        className="w-full bg-[#FFFFFF] border border-[#E5E5E5] rounded-lg px-3.5 py-2.5 text-xs text-[#111111] focus:outline-none focus:border-[#111111]"
                      />
                      {errors.city && (
                        <p className="text-[11px] text-[#c0392b] mt-1">{errors.city.message}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-[#111111] mb-1">
                        PIN Code (6 Digits) *
                      </label>
                      <input
                        type="text"
                        maxLength={6}
                        {...register("pincode")}
                        placeholder="PIN Code"
                        className="w-full bg-[#FFFFFF] border border-[#E5E5E5] rounded-lg px-3.5 py-2.5 text-xs text-[#111111] focus:outline-none focus:border-[#111111]"
                      />
                      {errors.pincode && (
                        <p className="text-[11px] text-[#c0392b] mt-1">{errors.pincode.message}</p>
                      )}
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block text-xs font-semibold text-[#111111] mb-1">
                        State *
                      </label>
                      <input
                        type="text"
                        {...register("state")}
                        placeholder="State"
                        className="w-full bg-[#FFFFFF] border border-[#E5E5E5] rounded-lg px-3.5 py-2.5 text-xs text-[#111111] focus:outline-none focus:border-[#111111]"
                      />
                      {errors.state && (
                        <p className="text-[11px] text-[#c0392b] mt-1">{errors.state.message}</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* 3. Payment Method */}
                <div className="bg-[#F5F5F5] border border-[#E5E5E5] rounded-2xl p-6 sm:p-7 space-y-4">
                  <h3 className="text-sm font-bold text-[#111111] flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-[#111111] text-[#FFFFFF] text-[10px] flex items-center justify-center font-sans font-bold">
                      3
                    </span>
                    <span>Payment Method</span>
                  </h3>

                  <div className="space-y-2 pt-1">
                    <label className="flex items-center justify-between p-3.5 rounded-xl border border-[#E5E5E5] bg-[#FFFFFF] cursor-pointer hover:border-[#111111] transition-colors">
                      <div className="flex items-center gap-2.5">
                        <input
                          type="radio"
                          value="upi"
                          {...register("paymentMethod")}
                          className="w-4 h-4 text-[#111111]"
                        />
                        <span className="text-xs font-semibold text-[#111111]">
                          UPI (Google Pay, PhonePe, Paytm, BHIM)
                        </span>
                      </div>
                      <span className="text-[10px] uppercase font-semibold text-[#666666]">Instant</span>
                    </label>

                    <label className="flex items-center justify-between p-3.5 rounded-xl border border-[#E5E5E5] bg-[#FFFFFF] cursor-pointer hover:border-[#111111] transition-colors">
                      <div className="flex items-center gap-2.5">
                        <input
                          type="radio"
                          value="card"
                          {...register("paymentMethod")}
                          className="w-4 h-4 text-[#111111]"
                        />
                        <span className="text-xs font-semibold text-[#111111]">
                          Credit / Debit Card (Visa, MasterCard, RuPay)
                        </span>
                      </div>
                      <span className="text-[10px] uppercase font-semibold text-[#666666]">SSL Encrypted</span>
                    </label>

                    <label className="flex items-center justify-between p-3.5 rounded-xl border border-[#E5E5E5] bg-[#FFFFFF] cursor-pointer hover:border-[#111111] transition-colors">
                      <div className="flex items-center gap-2.5">
                        <input
                          type="radio"
                          value="cod"
                          {...register("paymentMethod")}
                          className="w-4 h-4 text-[#111111]"
                        />
                        <span className="text-xs font-semibold text-[#111111]">
                          Cash on Delivery (COD)
                        </span>
                      </div>
                      <span className="text-[10px] uppercase font-semibold text-[#666666]">Pay at door</span>
                    </label>
                  </div>
                </div>
              </div>

              {/* Order Summary */}
              <div className="lg:col-span-5">
                <div className="bg-[#F5F5F5] border border-[#E5E5E5] rounded-2xl p-6 sm:p-7 space-y-5 sticky top-24">
                  <h3 className="text-base font-bold text-[#111111]">
                    Summary ({totalItems})
                  </h3>

                  <div className="divide-y divide-[#E5E5E5] border-y border-[#E5E5E5] py-2 max-h-56 overflow-y-auto">
                    {items.map((item) => (
                      <div key={item.packOption.id} className="py-2.5 flex justify-between text-xs">
                        <div>
                          <p className="font-semibold text-[#111111]">{item.productName}</p>
                          <p className="text-[11px] text-[#666666]">{item.packOption.name} × {item.quantity}</p>
                        </div>
                        <div className="font-bold text-[#111111]">
                          {formatPrice(item.packOption.price * item.quantity)}
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="space-y-2 text-xs text-[#666666] pb-1">
                    <div className="flex justify-between">
                      <span>Subtotal</span>
                      <span className="text-[#111111] font-semibold">{formatPrice(subtotal)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Express Shipping</span>
                      <span className="text-[#111111] font-semibold uppercase text-[10px]">FREE</span>
                    </div>
                  </div>

                  <div className="flex items-baseline justify-between border-t border-[#E5E5E5] pt-3">
                    <span className="font-semibold text-[#111111]">Total Payable</span>
                    <span className="text-2xl font-bold text-[#111111]">
                      {formatPrice(subtotal)}
                    </span>
                  </div>

                  {gatewayMessage && (
                    <div className="p-3.5 bg-[#FFFFFF] border border-[#E5E5E5] rounded-xl text-xs text-[#666666] space-y-1">
                      <p className="font-semibold text-[#111111]">Integration Notice</p>
                      <p className="text-[11px] leading-relaxed">{gatewayMessage}</p>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full flex items-center justify-center gap-2 bg-[#111111] text-[#FFFFFF] py-3.5 rounded-lg text-xs uppercase tracking-[0.14em] font-medium hover:bg-[#333333] transition-colors disabled:opacity-50"
                  >
                    <Lock className="w-3.5 h-3.5" />
                    <span>
                      {isSubmitting
                        ? "Verifying..."
                        : selectedPaymentMethod === "cod"
                        ? "Place Verified COD Order"
                        : "Proceed to Payment"}
                    </span>
                  </button>
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
