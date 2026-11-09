"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { AnnouncementBar } from "@/components/layout/AnnouncementBar";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import {
  User,
  ShoppingBag,
  Package,
  MapPin,
  Lock,
  Mail,
  ArrowRight,
  CheckCircle2,
  Clock,
  Truck,
  RotateCcw,
  Sparkles,
  LogOut,
  Settings,
  Eye,
  EyeOff,
  Bell,
  CreditCard,
} from "lucide-react";

export default function AccountPage() {
  // Tabs: 'signin' | 'register' | 'dashboard'
  const [activeTab, setActiveTab] = useState<"signin" | "register" | "dashboard">("signin");
  
  // Sign In Form State
  const [signInEmail, setSignInEmail] = useState("");
  const [signInPassword, setSignInPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  // Register Form State
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [registerEmail, setRegisterEmail] = useState("");
  const [registerPassword, setRegisterPassword] = useState("");
  const [agreeTerms, setAgreeTerms] = useState(true);

  // Customer Profile State (Demo Mock)
  const [customer, setCustomer] = useState({
    name: "Imran Ahmad",
    email: "imran@example.com",
    phone: "+91 98765 43210",
    memberSince: "November 2026",
    address: {
      line1: "Flat 402, Sea Green Apartments",
      line2: "Perry Cross Road, Bandra West",
      city: "Mumbai",
      state: "Maharashtra",
      pincode: "400050",
      country: "India",
    },
  });

  const [notificationMsg, setNotificationMsg] = useState("");

  const handleSignIn = (e: React.FormEvent) => {
    e.preventDefault();
    if (signInEmail) {
      setCustomer((prev) => ({
        ...prev,
        email: signInEmail,
        name: signInEmail.split("@")[0].replace(".", " "),
      }));
    }
    setActiveTab("dashboard");
    setNotificationMsg("Signed in successfully. Welcome to your GutGlow portal.");
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    const fullName = `${firstName.trim()} ${lastName.trim()}`.trim() || "GutGlow Customer";
    setCustomer((prev) => ({
      ...prev,
      name: fullName,
      email: registerEmail || "customer@example.com",
    }));
    setActiveTab("dashboard");
    setNotificationMsg("Account created successfully! Welcome to the GutGlow community.");
  };

  const handleSignOut = () => {
    setActiveTab("signin");
    setNotificationMsg("You have been signed out.");
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#FFFFFF]">
      <AnnouncementBar />
      <Header />

      <main className="flex-grow py-12 lg:py-20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          
          {/* Top Banner / Notification */}
          {notificationMsg && (
            <div className="p-4 rounded-xl bg-[#F4EBDD] border border-[#E5DAC8] flex items-center justify-between text-xs text-[#54232F] font-medium">
              <span className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#54232F]" />
                {notificationMsg}
              </span>
              <button
                type="button"
                onClick={() => setNotificationMsg("")}
                className="text-[#54232F] hover:underline font-bold text-[11px]"
              >
                Dismiss
              </button>
            </div>
          )}

          {/* =========================================================================
              VIEW 1: SIGN IN & CREATE ACCOUNT (Pre-Authentication View)
              ========================================================================= */}
          {activeTab !== "dashboard" ? (
            <div className="max-w-md mx-auto space-y-8 animate-fadeIn">
              {/* Header Title */}
              <div className="text-center space-y-3">
                <div className="inline-flex items-center gap-2 px-3.5 py-1 bg-[#F4EBDD] rounded-full border border-[#E5DAC8]">
                  <User className="w-3.5 h-3.5 text-[#54232F]" />
                  <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#54232F]">
                    GUTGLOW CUSTOMER PORTAL
                  </span>
                </div>

                <h1 className="text-3xl sm:text-4xl font-extrabold text-[#111111] tracking-[-0.03em]">
                  {activeTab === "signin" ? "Welcome Back." : "Create Your Account."}
                </h1>

                <p className="text-xs sm:text-sm text-[#666666]">
                  {activeTab === "signin"
                    ? "Sign in to track orders, manage your daily rituals, and access exclusive member benefits."
                    : "Join GutGlow for seamless order tracking, express checkout, and personalized digestive health tips."}
                </p>
              </div>

              {/* Tab Selector (Sign In vs Create Account) */}
              <div className="flex items-center bg-[#FAF6F0] p-1.5 rounded-full border border-[#EADBCA]">
                <button
                  type="button"
                  onClick={() => setActiveTab("signin")}
                  className={`flex-1 py-2.5 rounded-full text-xs font-bold uppercase tracking-wider transition-all ${
                    activeTab === "signin"
                      ? "bg-[#111111] text-[#FFFFFF] shadow-xs"
                      : "text-[#666666] hover:text-[#111111]"
                  }`}
                >
                  Sign In
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab("register")}
                  className={`flex-1 py-2.5 rounded-full text-xs font-bold uppercase tracking-wider transition-all ${
                    activeTab === "register"
                      ? "bg-[#111111] text-[#FFFFFF] shadow-xs"
                      : "text-[#666666] hover:text-[#111111]"
                  }`}
                >
                  Create Account
                </button>
              </div>

              {/* Quick Demo Preview Button */}
              <div className="p-3.5 rounded-xl bg-[#F4EBDD]/70 border border-[#E5DAC8] text-center">
                <p className="text-xs text-[#54232F] font-medium mb-1.5">
                  Want to preview the customer dashboard immediately?
                </p>
                <button
                  type="button"
                  onClick={() => setActiveTab("dashboard")}
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-[#111111] hover:text-[#54232F] transition-colors underline decoration-[#54232F]/40 underline-offset-4"
                >
                  <span>Preview Customer Orders Dashboard →</span>
                </button>
              </div>

              {/* --- SIGN IN FORM --- */}
              {activeTab === "signin" && (
                <form onSubmit={handleSignIn} className="p-6 sm:p-8 rounded-2xl bg-[#FAF6F0] border border-[#EADBCA] shadow-[0_8px_24px_rgba(40,30,20,0.04)] space-y-5">
                  <div className="space-y-1.5">
                    <label htmlFor="loginEmail" className="block text-xs font-bold uppercase tracking-wider text-[#171717]">
                      Email Address <span className="text-[#54232F]">*</span>
                    </label>
                    <div className="relative">
                      <input
                        id="loginEmail"
                        type="email"
                        required
                        placeholder="you@example.com"
                        value={signInEmail}
                        onChange={(e) => setSignInEmail(e.target.value)}
                        className="w-full px-4 py-3 bg-[#FFFFFF] border border-[#E5DAC8] rounded-xl text-sm text-[#111111] placeholder:text-[#999999] focus:outline-none focus:ring-2 focus:ring-[#54232F]/20 focus:border-[#54232F] transition-all"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <label htmlFor="loginPassword" className="block text-xs font-bold uppercase tracking-wider text-[#171717]">
                        Password <span className="text-[#54232F]">*</span>
                      </label>
                      <button
                        type="button"
                        onClick={() => alert("Password reset link will be sent to your email once backend is connected.")}
                        className="text-[11px] font-semibold text-[#54232F] hover:underline"
                      >
                        Forgot password?
                      </button>
                    </div>

                    <div className="relative">
                      <input
                        id="loginPassword"
                        type={showPassword ? "text" : "password"}
                        required
                        placeholder="••••••••"
                        value={signInPassword}
                        onChange={(e) => setSignInPassword(e.target.value)}
                        className="w-full px-4 py-3 bg-[#FFFFFF] border border-[#E5DAC8] rounded-xl text-sm text-[#111111] placeholder:text-[#999999] focus:outline-none focus:ring-2 focus:ring-[#54232F]/20 focus:border-[#54232F] transition-all"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3.5 top-3.5 text-[#888888] hover:text-[#111111]"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <input
                      id="remember"
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="w-4 h-4 rounded border-[#E5DAC8] text-[#54232F] focus:ring-[#54232F]"
                    />
                    <label htmlFor="remember" className="text-xs text-[#555555]">
                      Keep me signed in on this device
                    </label>
                  </div>

                  <button
                    type="submit"
                    className="w-full inline-flex items-center justify-center gap-2 bg-[#111111] text-[#FFFFFF] py-3.5 px-6 rounded-full text-xs font-bold uppercase tracking-wider hover:bg-[#333333] transition-colors shadow-xs"
                  >
                    <span>Sign In to Account</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>

                  <div className="text-center pt-2">
                    <p className="text-xs text-[#666666]">
                      New to GutGlow?{" "}
                      <button
                        type="button"
                        onClick={() => setActiveTab("register")}
                        className="font-bold text-[#54232F] hover:underline"
                      >
                        Create an account now
                      </button>
                    </p>
                  </div>
                </form>
              )}

              {/* --- CREATE ACCOUNT FORM --- */}
              {activeTab === "register" && (
                <form onSubmit={handleRegister} className="p-6 sm:p-8 rounded-2xl bg-[#FAF6F0] border border-[#EADBCA] shadow-[0_8px_24px_rgba(40,30,20,0.04)] space-y-5">
                  <div className="grid grid-cols-2 gap-3.5">
                    <div className="space-y-1.5">
                      <label htmlFor="regFirst" className="block text-xs font-bold uppercase tracking-wider text-[#171717]">
                        First Name <span className="text-[#54232F]">*</span>
                      </label>
                      <input
                        id="regFirst"
                        type="text"
                        required
                        placeholder="Imran"
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        className="w-full px-4 py-3 bg-[#FFFFFF] border border-[#E5DAC8] rounded-xl text-sm text-[#111111] placeholder:text-[#999999] focus:outline-none focus:ring-2 focus:ring-[#54232F]/20 focus:border-[#54232F] transition-all"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label htmlFor="regLast" className="block text-xs font-bold uppercase tracking-wider text-[#171717]">
                        Last Name <span className="text-[#54232F]">*</span>
                      </label>
                      <input
                        id="regLast"
                        type="text"
                        required
                        placeholder="Ahmad"
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        className="w-full px-4 py-3 bg-[#FFFFFF] border border-[#E5DAC8] rounded-xl text-sm text-[#111111] placeholder:text-[#999999] focus:outline-none focus:ring-2 focus:ring-[#54232F]/20 focus:border-[#54232F] transition-all"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label htmlFor="regEmail" className="block text-xs font-bold uppercase tracking-wider text-[#171717]">
                      Email Address <span className="text-[#54232F]">*</span>
                    </label>
                    <input
                      id="regEmail"
                      type="email"
                      required
                      placeholder="you@example.com"
                      value={registerEmail}
                      onChange={(e) => setRegisterEmail(e.target.value)}
                      className="w-full px-4 py-3 bg-[#FFFFFF] border border-[#E5DAC8] rounded-xl text-sm text-[#111111] placeholder:text-[#999999] focus:outline-none focus:ring-2 focus:ring-[#54232F]/20 focus:border-[#54232F] transition-all"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label htmlFor="regPassword" className="block text-xs font-bold uppercase tracking-wider text-[#171717]">
                      Create Password <span className="text-[#54232F]">*</span>
                    </label>
                    <input
                      id="regPassword"
                      type="password"
                      required
                      placeholder="At least 8 characters"
                      value={registerPassword}
                      onChange={(e) => setRegisterPassword(e.target.value)}
                      className="w-full px-4 py-3 bg-[#FFFFFF] border border-[#E5DAC8] rounded-xl text-sm text-[#111111] placeholder:text-[#999999] focus:outline-none focus:ring-2 focus:ring-[#54232F]/20 focus:border-[#54232F] transition-all"
                    />
                  </div>

                  <div className="flex items-start gap-2 pt-1">
                    <input
                      id="agree"
                      type="checkbox"
                      checked={agreeTerms}
                      onChange={(e) => setAgreeTerms(e.target.checked)}
                      className="w-4 h-4 mt-0.5 rounded border-[#E5DAC8] text-[#54232F] focus:ring-[#54232F]"
                    />
                    <label htmlFor="agree" className="text-xs text-[#555555] leading-relaxed">
                      I agree to the{" "}
                      <Link href="/policies/terms" className="underline hover:text-[#111111]">
                        Terms
                      </Link>{" "}
                      and{" "}
                      <Link href="/policies/privacy" className="underline hover:text-[#111111]">
                        Privacy Policy
                      </Link>
                      , and want to receive digestive wellness guides.
                    </label>
                  </div>

                  <button
                    type="submit"
                    className="w-full inline-flex items-center justify-center gap-2 bg-[#111111] text-[#FFFFFF] py-3.5 px-6 rounded-full text-xs font-bold uppercase tracking-wider hover:bg-[#333333] transition-colors shadow-xs"
                  >
                    <span>Create GutGlow Account</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>

                  <div className="text-center pt-2">
                    <p className="text-xs text-[#666666]">
                      Already have an account?{" "}
                      <button
                        type="button"
                        onClick={() => setActiveTab("signin")}
                        className="font-bold text-[#54232F] hover:underline"
                      >
                        Sign in here
                      </button>
                    </p>
                  </div>
                </form>
              )}
            </div>
          ) : (
            /* =========================================================================
                VIEW 2: AUTHENTICATED CUSTOMER DASHBOARD (Order History & Addresses)
                ========================================================================= */
            <div className="space-y-8 animate-fadeIn">
              {/* Profile Welcome Banner */}
              <div className="p-6 sm:p-8 rounded-2xl sm:rounded-3xl bg-[#FAF6F0] border border-[#EADBCA] shadow-[0_8px_24px_rgba(40,30,20,0.04)] flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-full bg-[#54232F] text-[#FFFFFF] flex items-center justify-center text-xl font-bold uppercase tracking-wider shrink-0 shadow-sm">
                    {customer.name.slice(0, 2)}
                  </div>
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <h1 className="text-xl sm:text-2xl font-extrabold text-[#111111]">
                        Hello, {customer.name}
                      </h1>
                      <span className="px-2 py-0.5 bg-[#54232F] text-[#FFFFFF] rounded-full text-[9px] font-bold uppercase tracking-wider">
                        Ritual Member
                      </span>
                    </div>
                    <p className="text-xs text-[#666666]">{customer.email} · Member since {customer.memberSince}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Link
                    href="/track-order"
                    className="inline-flex items-center gap-2 bg-[#111111] text-[#FFFFFF] px-5 py-2.5 rounded-full text-xs font-bold uppercase tracking-wider hover:bg-[#333333] transition-colors"
                  >
                    <Truck className="w-3.5 h-3.5" />
                    <span>Track Shipment</span>
                  </Link>

                  <button
                    type="button"
                    onClick={handleSignOut}
                    className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-full border border-[#E5DAC8] text-xs font-bold uppercase tracking-wider text-[#666666] hover:text-[#111111] hover:bg-[#FFFFFF] transition-colors"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Sign Out</span>
                  </button>
                </div>
              </div>

              {/* Grid: Orders (Left 8 cols) & Account Info (Right 4 cols) */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                
                {/* LEFT: ORDER HISTORY */}
                <div className="lg:col-span-8 space-y-6">
                  <div className="flex items-center justify-between border-b border-[#E8E8E8] pb-3">
                    <div className="flex items-center gap-2">
                      <ShoppingBag className="w-4 h-4 text-[#54232F]" />
                      <h2 className="text-base font-bold uppercase tracking-wider text-[#111111]">
                        Your Order History
                      </h2>
                    </div>
                    <span className="text-xs text-[#666666] font-medium">2 Total Orders</span>
                  </div>

                  {/* Order 1: Active In-Transit */}
                  <div className="p-6 rounded-2xl bg-[#FFFFFF] border border-[#E5DAC8] shadow-sm space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-[#F0EAE1]">
                      <div className="space-y-0.5">
                        <span className="text-xs font-mono font-bold text-[#54232F]">Order #GG-84291</span>
                        <p className="text-[11px] text-[#888888]">Placed on November 8, 2026 · Express Shipping</p>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider bg-[#F4EBDD] text-[#54232F] border border-[#E5DAC8] flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#54232F] animate-pulse" />
                          In Transit
                        </span>
                        <span className="text-sm font-extrabold text-[#111111]">₹4,899</span>
                      </div>
                    </div>

                    {/* Item Details */}
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex items-center gap-4">
                        <div className="relative w-16 h-16 rounded-xl overflow-hidden bg-[#FAF6F0] border border-[#EADBCA] shrink-0">
                          <Image
                            src="/images/gutglow-product-front.jpg"
                            alt="GutGlow Daily Wellness Formula"
                            fill
                            sizes="64px"
                            className="object-cover object-center"
                          />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-[#111111]">
                            GutGlow Daily Wellness Formula — 3-Month Ritual
                          </p>
                          <p className="text-xs text-[#666666] mt-0.5">
                            90 Servings · Net Wt. 600g · Free Precision Brass Scoop Included
                          </p>
                          <p className="text-[11px] text-[#888888] mt-1">Quantity: 1</p>
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-[#F0EAE1]">
                      <span className="text-xs text-[#059669] font-medium flex items-center gap-1">
                        <Truck className="w-3.5 h-3.5" />
                        Estimated delivery: Thursday, Nov 12
                      </span>

                      <div className="flex items-center gap-3">
                        <Link
                          href="/track-order"
                          className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider bg-[#111111] text-[#FFFFFF] px-4 py-2 rounded-full hover:bg-[#333333] transition-colors"
                        >
                          <span>Track Package</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </Link>
                      </div>
                    </div>
                  </div>

                  {/* Order 2: Delivered History */}
                  <div className="p-6 rounded-2xl bg-[#FFFFFF] border border-[#E8E8E8] shadow-xs space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-[#F5F5F5]">
                      <div className="space-y-0.5">
                        <span className="text-xs font-mono font-bold text-[#666666]">Order #GG-61028</span>
                        <p className="text-[11px] text-[#888888]">Placed on August 14, 2026 · Delivered Aug 17, 2026</p>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider bg-[#ECFDF5] text-[#059669] border border-[#A7F3D0] flex items-center gap-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          Delivered
                        </span>
                        <span className="text-sm font-extrabold text-[#111111]">₹1,999</span>
                      </div>
                    </div>

                    {/* Item Details */}
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex items-center gap-4">
                        <div className="relative w-16 h-16 rounded-xl overflow-hidden bg-[#FAF6F0] border border-[#EADBCA] shrink-0">
                          <Image
                            src="/images/philosophy-ritual.webp"
                            alt="GutGlow Daily Wellness Formula"
                            fill
                            sizes="64px"
                            className="object-cover object-center"
                          />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-[#111111]">
                            GutGlow Daily Wellness Formula — 1-Month Supply
                          </p>
                          <p className="text-xs text-[#666666] mt-0.5">
                            30 Servings · Net Wt. 200g
                          </p>
                          <p className="text-[11px] text-[#888888] mt-1">Quantity: 1</p>
                        </div>
                      </div>
                    </div>

                    {/* Reorder Button */}
                    <div className="flex items-center justify-end pt-3 border-t border-[#F5F5F5]">
                      <Link
                        href="/product"
                        className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#54232F] hover:text-[#111111] transition-colors py-1"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        <span>Reorder Formula</span>
                      </Link>
                    </div>
                  </div>
                </div>

                {/* RIGHT: ACCOUNT DETAILS & ADDRESSES */}
                <div className="lg:col-span-4 space-y-6">
                  {/* Shipping Address */}
                  <div className="p-6 rounded-2xl bg-[#FAF6F0] border border-[#EADBCA] space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-[#54232F]" />
                        <h3 className="text-xs font-bold uppercase tracking-wider text-[#111111]">
                          Primary Delivery Address
                        </h3>
                      </div>
                    </div>

                    <div className="text-xs text-[#555555] leading-relaxed space-y-0.5 pt-1">
                      <p className="font-bold text-[#111111]">{customer.name}</p>
                      <p>{customer.address.line1}</p>
                      <p>{customer.address.line2}</p>
                      <p>
                        {customer.address.city}, {customer.address.state} — {customer.address.pincode}
                      </p>
                      <p>{customer.address.country}</p>
                      <p className="text-[11px] text-[#888888] pt-1">Phone: {customer.phone}</p>
                    </div>

                    <div className="pt-2">
                      <button
                        type="button"
                        onClick={() => alert("Address modification will be enabled with backend database.")}
                        className="text-xs font-semibold text-[#54232F] hover:underline"
                      >
                        Edit Shipping Details
                      </button>
                    </div>
                  </div>

                  {/* Wellness Concierge */}
                  <div className="p-6 rounded-2xl bg-[#FFFFFF] border border-[#E8E8E8] space-y-3 shadow-xs">
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-[#54232F]" />
                      <h3 className="text-xs font-bold uppercase tracking-wider text-[#111111]">
                        GutGlow Concierge
                      </h3>
                    </div>

                    <p className="text-xs text-[#666666] leading-relaxed">
                      Need assistance with your ritual routine, dosage timing, or an ongoing shipment?
                    </p>

                    <div className="pt-1">
                      <Link
                        href="/contact"
                        className="inline-flex items-center gap-1.5 text-xs font-bold text-[#111111] hover:text-[#54232F] transition-colors"
                      >
                        <span>Contact Support Desk</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </div>

                  {/* Backend Integration Note */}
                  <div className="p-4 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] space-y-1.5">
                    <p className="text-[11px] font-bold uppercase tracking-wider text-[#475569]">
                      Backend Ready Architecture
                    </p>
                    <p className="text-[11px] text-[#64748B] leading-relaxed">
                      This customer portal is prepared to connect with Firebase Auth, Supabase, Shopify Storefront API, or custom PostgreSQL endpoints when you build your backend.
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
