"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { AnnouncementBar } from "@/components/layout/AnnouncementBar";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { auth, db } from "@/lib/firebase/client";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  onAuthStateChanged,
  updateProfile,
} from "firebase/auth";
import { doc, setDoc, getDoc, serverTimestamp } from "firebase/firestore";
import {
  User,
  ShoppingBag,
  MapPin,
  Lock,
  Mail,
  ArrowRight,
  CheckCircle2,
  Truck,
  RotateCcw,
  Sparkles,
  LogOut,
  Eye,
  EyeOff,
  Loader2,
  AlertCircle,
  Plus,
  Trash2,
  Edit3,
  X,
  Phone,
  ShieldCheck,
} from "lucide-react";
import { INDIAN_GST_STATE_CODES } from "@/lib/validations/addressSchema";
import type { FirestoreAddress } from "@/types/firestore/user";

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

  // Auth processing state
  const [emailLoading, setEmailLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [authError, setAuthError] = useState("");

  // Customer Profile State
  const [customer, setCustomer] = useState({
    name: "GutGlow Customer",
    firstName: "",
    lastName: "",
    email: "customer@gutglow.com",
    phone: "",
    memberSince: "November 2026",
    totalOrders: 0,
    totalSpendInPaise: 0,
  });

  // Saved Addresses State
  const [addresses, setAddresses] = useState<FirestoreAddress[]>([]);
  const [loadingAddresses, setLoadingAddresses] = useState(false);
  const [addressActionLoading, setAddressActionLoading] = useState(false);

  // Customer Orders State
  const [customerOrders, setCustomerOrders] = useState<any[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(false);

  // Address Modal State
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [editingAddressId, setEditingAddressId] = useState<string | null>(null);
  const [addressForm, setAddressForm] = useState({
    fullName: "",
    phone: "",
    addressLine1: "",
    addressLine2: "",
    landmark: "",
    city: "",
    state: "Maharashtra",
    stateCode: "27",
    pincode: "",
    isDefaultShipping: true,
    isDefaultBilling: false,
  });
  const [addressFormError, setAddressFormError] = useState("");

  // Profile Edit Modal State
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [profileForm, setProfileForm] = useState({
    firstName: "",
    lastName: "",
    phone: "",
  });
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileError, setProfileError] = useState("");

  const [notificationMsg, setNotificationMsg] = useState("");

  // Load customer profile & address book from backend
  const loadCustomerData = async (firebaseUser: any) => {
    try {
      setLoadingAddresses(true);
      const token = await firebaseUser.getIdToken();
      const res = await fetch("/api/v1/customer/profile", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const json = await res.json();
        if (json.success && json.data) {
          const u = json.data.user || {};
          const addrs = json.data.addresses || [];
          const fName = u.firstName || firebaseUser.displayName?.split(" ")[0] || "";
          const lName = u.lastName || firebaseUser.displayName?.split(" ").slice(1).join(" ") || "";
          const fullName = `${fName} ${lName}`.trim() || firebaseUser.displayName || firebaseUser.email?.split("@")[0] || "Ritual Member";

          setCustomer({
            name: fullName,
            firstName: fName,
            lastName: lName,
            email: u.email || firebaseUser.email || "",
            phone: u.phone || "",
            memberSince: u.createdAt
              ? new Date((u.createdAt.seconds || u.createdAt._seconds || Math.floor(Date.now() / 1000)) * 1000).toLocaleDateString("en-IN", {
                  month: "long",
                  year: "numeric",
                })
              : "November 2026",
            totalOrders: u.totalOrders || 0,
            totalSpendInPaise: u.totalSpendInPaise || 0,
          });

          setProfileForm({
            firstName: fName,
            lastName: lName,
            phone: u.phone || "",
          });

          setAddresses(addrs);
        }
      }

      // Fetch customer orders from live database
      try {
        setLoadingOrders(true);
        const ordRes = await fetch("/api/v1/customer/orders", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (ordRes.ok) {
          const ordJson = await ordRes.json();
          if (ordJson.success && Array.isArray(ordJson.data?.orders)) {
            setCustomerOrders(ordJson.data.orders);
          }
        }
      } catch (ordErr) {
        console.warn("[Account] Notice fetching customer orders:", ordErr);
      } finally {
        setLoadingOrders(false);
      }
    } catch (err) {
      console.error("[Account] Failed to load customer profile:", err);
    } finally {
      setLoadingAddresses(false);
    }
  };

  // Listen to live Firebase Auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        await loadCustomerData(firebaseUser);
        setActiveTab("dashboard");
      }
    });

    return () => unsubscribe();
  }, []);

  const syncUserToFirestore = async (uid: string, email: string, name?: string) => {
    try {
      const userDocRef = doc(db, "users", uid);
      const userSnap = await getDoc(userDocRef);

      if (!userSnap.exists()) {
        await setDoc(userDocRef, {
          uid,
          email,
          firstName: name?.split(" ")[0] || "",
          lastName: name?.split(" ").slice(1).join(" ") || "",
          totalOrders: 0,
          totalSpendInPaise: 0,
          isEmailVerified: true,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
      }
    } catch (err) {
      console.warn("[Account] User sync notice:", err);
    }
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError("");
    setEmailLoading(true);

    try {
      const userCred = await signInWithEmailAndPassword(auth, signInEmail, signInPassword);
      await loadCustomerData(userCred.user);
      setActiveTab("dashboard");
      setNotificationMsg("Signed in successfully. Welcome to your GutGlow portal.");
    } catch (err: unknown) {
      console.error("[Sign In Error]:", err);
      const msg = err instanceof Error ? err.message : "Failed to sign in. Please verify your credentials.";
      setAuthError(msg);
    } finally {
      setEmailLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError("");
    setEmailLoading(true);

    const fullName = `${firstName.trim()} ${lastName.trim()}`.trim() || "GutGlow Customer";

    try {
      const userCred = await createUserWithEmailAndPassword(auth, registerEmail, registerPassword);
      await updateProfile(userCred.user, { displayName: fullName });
      await syncUserToFirestore(userCred.user.uid, registerEmail, fullName);
      await loadCustomerData(userCred.user);

      setActiveTab("dashboard");
      setNotificationMsg("Account created successfully! Welcome to the GutGlow community.");
    } catch (err: unknown) {
      console.error("[Register Error]:", err);
      const msg = err instanceof Error ? err.message : "Failed to create account. Please try again.";
      setAuthError(msg);
    } finally {
      setEmailLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setAuthError("");
    setGoogleLoading(true);

    try {
      const provider = new GoogleAuthProvider();
      const userCred = await signInWithPopup(auth, provider);
      const name = userCred.user.displayName || "GutGlow Customer";
      const email = userCred.user.email || "";

      await syncUserToFirestore(userCred.user.uid, email, name);
      await loadCustomerData(userCred.user);

      setActiveTab("dashboard");
      setNotificationMsg("Signed in with Google successfully.");
    } catch (err: unknown) {
      const firebaseErr = err as { code?: string; message?: string };
      if (firebaseErr?.code === "auth/popup-closed-by-user") {
        return;
      }
      console.error("[Google Auth Error]:", err);
      const msg = err instanceof Error ? err.message : "Google authentication was cancelled or failed.";
      setAuthError(msg);
    } finally {
      setGoogleLoading(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      setAddresses([]);
      setActiveTab("signin");
      setNotificationMsg("You have been signed out.");
    } catch (err) {
      console.error("[Sign Out Error]:", err);
    }
  };

  // Open address modal for creating a new address
  const handleOpenAddAddress = () => {
    setEditingAddressId(null);
    setAddressForm({
      fullName: customer.name || "",
      phone: customer.phone || "",
      addressLine1: "",
      addressLine2: "",
      landmark: "",
      city: "",
      state: "Maharashtra",
      stateCode: "27",
      pincode: "",
      isDefaultShipping: addresses.length === 0,
      isDefaultBilling: addresses.length === 0,
    });
    setAddressFormError("");
    setShowAddressModal(true);
  };

  // Open address modal for editing
  const handleOpenEditAddress = (addr: FirestoreAddress) => {
    setEditingAddressId(addr.id);
    setAddressForm({
      fullName: addr.fullName || customer.name || "",
      phone: addr.phone || customer.phone || "",
      addressLine1: addr.addressLine1 || "",
      addressLine2: addr.addressLine2 || "",
      landmark: addr.landmark || "",
      city: addr.city || "",
      state: addr.state || "Maharashtra",
      stateCode: addr.stateCode || "27",
      pincode: addr.pincode || "",
      isDefaultShipping: !!addr.isDefaultShipping,
      isDefaultBilling: !!addr.isDefaultBilling,
    });
    setAddressFormError("");
    setShowAddressModal(true);
  };

  // Save address (Create or Update)
  const handleSaveAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    setAddressFormError("");
    setAddressActionLoading(true);

    try {
      if (!auth.currentUser) throw new Error("Please log in to save addresses.");
      const token = await auth.currentUser.getIdToken();

      const url = editingAddressId
        ? `/api/v1/customer/addresses/${editingAddressId}`
        : `/api/v1/customer/addresses`;
      const method = editingAddressId ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(addressForm),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to save address.");
      }

      setShowAddressModal(false);
      await loadCustomerData(auth.currentUser);
      setNotificationMsg(
        editingAddressId
          ? "Delivery address updated successfully."
          : "New delivery address added successfully."
      );
    } catch (err: unknown) {
      setAddressFormError(err instanceof Error ? err.message : "Failed to save address");
    } finally {
      setAddressActionLoading(false);
    }
  };

  // Delete address
  const handleDeleteAddress = async (addressId: string) => {
    if (!window.confirm("Are you sure you want to delete this delivery address?")) return;
    setAddressActionLoading(true);

    try {
      if (!auth.currentUser) throw new Error("Please log in.");
      const token = await auth.currentUser.getIdToken();

      const res = await fetch(`/api/v1/customer/addresses/${addressId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || "Failed to delete address.");

      await loadCustomerData(auth.currentUser);
      setNotificationMsg("Address removed.");
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Failed to delete address");
    } finally {
      setAddressActionLoading(false);
    }
  };

  // Set default shipping
  const handleSetDefaultShipping = async (addressId: string) => {
    setAddressActionLoading(true);
    try {
      if (!auth.currentUser) throw new Error("Please log in.");
      const token = await auth.currentUser.getIdToken();

      const res = await fetch(`/api/v1/customer/addresses/${addressId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ isDefaultShipping: true }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || "Failed to update default address.");

      await loadCustomerData(auth.currentUser);
      setNotificationMsg("Default shipping address updated.");
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Failed to update default address");
    } finally {
      setAddressActionLoading(false);
    }
  };

  // Save profile
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileError("");
    setProfileSaving(true);

    try {
      if (!auth.currentUser) throw new Error("Please log in.");
      const token = await auth.currentUser.getIdToken();

      const res = await fetch("/api/v1/customer/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(profileForm),
      });

      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || "Failed to update profile.");

      setShowProfileModal(false);
      await loadCustomerData(auth.currentUser);
      setNotificationMsg("Your profile details have been saved.");
    } catch (err: unknown) {
      setProfileError(err instanceof Error ? err.message : "Failed to update profile");
    } finally {
      setProfileSaving(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#FFFFFF]">
      <AnnouncementBar />
      <Header />

      <main className="flex-grow py-12 lg:py-20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          
          {/* Top Banner / Notification */}
          {notificationMsg && (
            <div className="p-4 rounded-xl bg-[#F4EBDD] border border-[#E5DAC8] flex items-center justify-between text-xs text-[#54232F] font-medium animate-fadeIn">
              <span className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#54232F] shrink-0" />
                {notificationMsg}
              </span>
              <button
                type="button"
                onClick={() => setNotificationMsg("")}
                className="text-[#54232F] hover:underline font-bold text-[11px] ml-4 shrink-0"
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

              {/* --- SIGN IN FORM --- */}
              {activeTab === "signin" && (
                <form onSubmit={handleSignIn} className="p-6 sm:p-8 rounded-2xl bg-[#FAF6F0] border border-[#EADBCA] shadow-[0_8px_24px_rgba(40,30,20,0.04)] space-y-5">
                  {/* Google Sign In at TOP */}
                  <button
                    type="button"
                    onClick={handleGoogleSignIn}
                    disabled={googleLoading || emailLoading}
                    className="w-full inline-flex items-center justify-center gap-2.5 bg-[#FFFFFF] border border-[#E5DAC8] text-[#111111] py-3 px-6 rounded-full text-xs font-bold uppercase tracking-wider hover:bg-[#F4EBDD]/40 transition-colors shadow-xs disabled:opacity-50"
                  >
                    {googleLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin text-[#111111]" />
                        <span>Connecting to Google...</span>
                      </>
                    ) : (
                      <>
                        <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                          <path
                            fill="#4285F4"
                            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                          />
                          <path
                            fill="#34A853"
                            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                          />
                          <path
                            fill="#FBBC05"
                            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                          />
                          <path
                            fill="#EA4335"
                            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                          />
                        </svg>
                        <span>Sign In with Google</span>
                      </>
                    )}
                  </button>

                  <div className="relative flex items-center justify-center py-1">
                    <div className="border-t border-[#E5DAC8] w-full" />
                    <span className="bg-[#FAF6F0] px-3 text-[10px] font-bold uppercase tracking-wider text-[#888888] absolute">
                      or sign in with email
                    </span>
                  </div>

                  <div className="space-y-1.5 pt-1">
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
                        onClick={() => alert("Password reset functionality will be sent to your registered email.")}
                        className="text-[11px] text-[#54232F] hover:underline font-semibold"
                      >
                        Forgot Password?
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
                        className="w-full px-4 py-3 bg-[#FFFFFF] border border-[#E5DAC8] rounded-xl text-sm text-[#111111] placeholder:text-[#999999] focus:outline-none focus:ring-2 focus:ring-[#54232F]/20 focus:border-[#54232F] transition-all pr-10"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-[#888888] hover:text-[#111111]"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={rememberMe}
                        onChange={(e) => setRememberMe(e.target.checked)}
                        className="w-4 h-4 rounded border-[#E5DAC8] text-[#54232F] focus:ring-[#54232F]"
                      />
                      <span className="text-xs text-[#555555]">Keep me signed in on this device</span>
                    </label>
                  </div>

                  {authError && (
                    <div className="p-3 bg-[#FDF2F2] border border-[#F8D7DA] rounded-xl text-xs text-[#9B1C1C] flex items-start gap-2">
                      <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-[#9B1C1C]" />
                      <span>{authError}</span>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={emailLoading || googleLoading}
                    className="w-full inline-flex items-center justify-center gap-2 bg-[#111111] text-[#FFFFFF] py-3.5 px-6 rounded-full text-xs font-bold uppercase tracking-wider hover:bg-[#333333] transition-colors shadow-xs disabled:opacity-50"
                  >
                    {emailLoading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <>
                        <span>Sign In to Account</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
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
                  {/* Google Sign Up at TOP */}
                  <button
                    type="button"
                    onClick={handleGoogleSignIn}
                    disabled={googleLoading || emailLoading}
                    className="w-full inline-flex items-center justify-center gap-2.5 bg-[#FFFFFF] border border-[#E5DAC8] text-[#111111] py-3 px-6 rounded-full text-xs font-bold uppercase tracking-wider hover:bg-[#F4EBDD]/40 transition-colors shadow-xs disabled:opacity-50"
                  >
                    {googleLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin text-[#111111]" />
                        <span>Connecting to Google...</span>
                      </>
                    ) : (
                      <>
                        <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                          <path
                            fill="#4285F4"
                            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                          />
                          <path
                            fill="#34A853"
                            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                          />
                          <path
                            fill="#FBBC05"
                            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                          />
                          <path
                            fill="#EA4335"
                            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                          />
                        </svg>
                        <span>Sign Up with Google</span>
                      </>
                    )}
                  </button>

                  <div className="relative flex items-center justify-center py-1">
                    <div className="border-t border-[#E5DAC8] w-full" />
                    <span className="bg-[#FAF6F0] px-3 text-[10px] font-bold uppercase tracking-wider text-[#888888] absolute">
                      or register with email
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-3.5 pt-1">
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

                  {authError && (
                    <div className="p-3 bg-[#FDF2F2] border border-[#F8D7DA] rounded-xl text-xs text-[#9B1C1C] flex items-start gap-2">
                      <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-[#9B1C1C]" />
                      <span>{authError}</span>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={emailLoading || googleLoading}
                    className="w-full inline-flex items-center justify-center gap-2 bg-[#111111] text-[#FFFFFF] py-3.5 px-6 rounded-full text-xs font-bold uppercase tracking-wider hover:bg-[#333333] transition-colors shadow-xs disabled:opacity-50"
                  >
                    {emailLoading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <>
                        <span>Create GutGlow Account</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
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
                VIEW 2: AUTHENTICATED CUSTOMER DASHBOARD (Order History & Address Book)
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
                    <p className="text-xs text-[#666666] flex flex-wrap items-center gap-2">
                      <span>{customer.email}</span>
                      {customer.phone && <span>· +91 {customer.phone}</span>}
                      <span>· Member since {customer.memberSince}</span>
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setProfileForm({
                        firstName: customer.firstName,
                        lastName: customer.lastName,
                        phone: customer.phone,
                      });
                      setProfileError("");
                      setShowProfileModal(true);
                    }}
                    className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-full border border-[#E5DAC8] text-xs font-bold uppercase tracking-wider text-[#111111] hover:bg-[#FFFFFF] transition-colors"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>Edit Profile</span>
                  </button>

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

              {/* Grid: Orders (Left 7 cols) & Address Book (Right 5 cols) */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                
                {/* LEFT: ORDER HISTORY */}
                <div className="lg:col-span-7 space-y-6">
                  <div className="flex items-center justify-between border-b border-[#E8E8E8] pb-3">
                    <div className="flex items-center gap-2">
                      <ShoppingBag className="w-4 h-4 text-[#54232F]" />
                      <h2 className="text-base font-bold uppercase tracking-wider text-[#111111]">
                        Your Order History
                      </h2>
                    </div>
                    <span className="text-xs text-[#666666] font-medium">
                      {customerOrders.length} {customerOrders.length === 1 ? "Order" : "Orders"}
                    </span>
                  </div>

                  {loadingOrders ? (
                    <div className="p-12 text-center text-[#666666] space-y-3 bg-[#FFFFFF] rounded-2xl border border-[#EADBCA]">
                      <Loader2 className="w-6 h-6 animate-spin mx-auto text-[#54232F]" />
                      <p className="text-xs font-medium">Loading your orders...</p>
                    </div>
                  ) : customerOrders.length === 0 ? (
                    <div className="p-8 sm:p-12 rounded-2xl bg-[#FFFFFF] border border-[#EADBCA] text-center space-y-4">
                      <div className="w-14 h-14 rounded-full bg-[#FAF6F0] border border-[#EADBCA] flex items-center justify-center mx-auto text-[#54232F]">
                        <ShoppingBag className="w-6 h-6 stroke-[1.5]" />
                      </div>
                      <div className="space-y-1.5 max-w-sm mx-auto">
                        <h3 className="text-base font-bold text-[#111111]">
                          No orders placed yet
                        </h3>
                        <p className="text-xs text-[#666666] leading-relaxed">
                          When you start your GutGlow daily ritual, your order details, live courier tracking AWB, and delivery milestones will appear here.
                        </p>
                      </div>
                      <div className="pt-2">
                        <Link
                          href="/product"
                          className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-[#8BC5FF] text-[#111111] text-xs font-bold uppercase tracking-wider hover:bg-[#7ABBF7] transition-colors"
                        >
                          <span>Explore Daily Formula</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </Link>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {customerOrders.map((ord) => (
                        <div key={ord.id} className="p-6 rounded-2xl bg-[#FFFFFF] border border-[#E5DAC8] shadow-sm space-y-4">
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-[#F0EAE1]">
                            <div className="space-y-0.5">
                              <span className="text-xs font-mono font-bold text-[#54232F]">Order #{ord.orderNumber || ord.id}</span>
                              <p className="text-[11px] text-[#888888]">
                                {ord.createdAt?.seconds
                                  ? new Date(ord.createdAt.seconds * 1000).toLocaleDateString("en-IN", {
                                      day: "numeric",
                                      month: "short",
                                      year: "numeric",
                                    })
                                  : "Recent"}
                                {ord.paymentMode ? ` · ${ord.paymentMode === "partial_cod" ? "Partial COD" : "Prepaid"}` : ""}
                              </p>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider bg-[#F4EBDD] text-[#54232F] border border-[#E5DAC8]">
                                {ord.shipmentStatus || ord.orderStatus || "Confirmed"}
                              </span>
                              <span className="text-sm font-extrabold text-[#111111]">
                                ₹{ord.pricing?.finalPayablePaise ? (ord.pricing.finalPayablePaise / 100).toLocaleString("en-IN") : "—"}
                              </span>
                            </div>
                          </div>

                          {/* Items */}
                          <div className="space-y-3">
                            {ord.items?.map((item: any, idx: number) => (
                              <div key={idx} className="flex items-center gap-4">
                                <div className="relative w-14 h-14 rounded-xl overflow-hidden bg-[#FAF6F0] border border-[#EADBCA] shrink-0">
                                  <Image
                                    src="/images/gutglow-product-front.jpg"
                                    alt={item.name || "GutGlow Formula"}
                                    fill
                                    sizes="56px"
                                    className="object-cover object-center"
                                  />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="text-xs font-bold text-[#111111] truncate">{item.name}</p>
                                  <p className="text-[11px] text-[#666666]">{item.packLabel || "200g jar"} · Qty: {item.quantity}</p>
                                </div>
                              </div>
                            ))}
                          </div>

                          {/* Actions */}
                          <div className="flex items-center justify-between gap-3 pt-3 border-t border-[#F0EAE1]">
                            <span className="text-xs text-[#059669] font-medium">
                              Express Insulated Shipping
                            </span>
                            <div className="flex items-center gap-2">
                              <Link
                                href={`/track-order?orderId=${ord.orderNumber || ord.id}`}
                                className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider bg-[#111111] text-[#FFFFFF] px-4 py-2 rounded-full hover:bg-[#333333] transition-colors"
                              >
                                <span>Track Package</span>
                                <ArrowRight className="w-3.5 h-3.5" />
                              </Link>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* RIGHT: LIVE ADDRESS BOOK & ACCOUNT STATUS */}
                <div className="lg:col-span-5 space-y-6">
                  
                  {/* Address Book Card */}
                  <div className="p-6 rounded-2xl bg-[#FAF6F0] border border-[#EADBCA] space-y-4">
                    <div className="flex items-center justify-between border-b border-[#EADBCA] pb-3">
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-[#54232F]" />
                        <h3 className="text-xs font-bold uppercase tracking-wider text-[#111111]">
                          Saved Addresses
                        </h3>
                      </div>

                      <button
                        type="button"
                        onClick={handleOpenAddAddress}
                        className="inline-flex items-center gap-1 px-3 py-1.5 bg-[#111111] text-[#FFFFFF] rounded-full text-[11px] font-bold uppercase tracking-wider hover:bg-[#333333] transition-colors shadow-xs"
                      >
                        <Plus className="w-3 h-3" />
                        <span>Add New</span>
                      </button>
                    </div>

                    {loadingAddresses ? (
                      <div className="py-8 flex flex-col items-center justify-center text-xs text-[#666666] gap-2">
                        <Loader2 className="w-5 h-5 animate-spin text-[#54232F]" />
                        <span>Loading address book...</span>
                      </div>
                    ) : addresses.length === 0 ? (
                      <div className="py-6 text-center space-y-3">
                        <div className="w-10 h-10 rounded-full bg-[#EADBCA]/60 flex items-center justify-center mx-auto text-[#54232F]">
                          <MapPin className="w-5 h-5" />
                        </div>
                        <p className="text-xs text-[#666666]">
                          No delivery addresses saved yet. Add your primary shipping address for seamless one-click checkout.
                        </p>
                        <button
                          type="button"
                          onClick={handleOpenAddAddress}
                          className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#54232F] hover:underline"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>Add Your First Address</span>
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {addresses.map((addr) => (
                          <div
                            key={addr.id}
                            className="p-4 rounded-xl bg-[#FFFFFF] border border-[#E5DAC8] space-y-2 relative shadow-xs"
                          >
                            <div className="flex items-center justify-between">
                              <span className="font-bold text-xs text-[#111111]">
                                {addr.fullName || customer.name}
                              </span>
                              <div className="flex items-center gap-1.5">
                                {addr.isDefaultShipping ? (
                                  <span className="px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider bg-[#ECFDF5] text-[#059669] border border-[#A7F3D0]">
                                    Default
                                  </span>
                                ) : (
                                  <button
                                    type="button"
                                    onClick={() => handleSetDefaultShipping(addr.id)}
                                    disabled={addressActionLoading}
                                    className="text-[10px] text-[#666666] hover:text-[#111111] underline"
                                  >
                                    Set Default
                                  </button>
                                )}
                              </div>
                            </div>

                            <div className="text-xs text-[#555555] leading-relaxed">
                              <p>{addr.addressLine1}</p>
                              {addr.addressLine2 && <p>{addr.addressLine2}</p>}
                              {addr.landmark && <p className="text-[#888888]">Near {addr.landmark}</p>}
                              <p>
                                {addr.city}, {addr.state} — <span className="font-mono font-medium">{addr.pincode}</span>
                              </p>
                              <p className="text-[11px] text-[#888888] pt-1">
                                Phone: +91 {addr.phone || customer.phone || "Not provided"} · GST Code: {addr.stateCode}
                              </p>
                            </div>

                            <div className="flex items-center justify-end gap-3 pt-2 border-t border-[#F4EBDD]">
                              <button
                                type="button"
                                onClick={() => handleOpenEditAddress(addr)}
                                className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#54232F] hover:underline"
                              >
                                <Edit3 className="w-3 h-3" />
                                <span>Edit</span>
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDeleteAddress(addr.id)}
                                disabled={addressActionLoading}
                                className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#9B1C1C] hover:underline"
                              >
                                <Trash2 className="w-3 h-3" />
                                <span>Delete</span>
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Account Summary & Trust Card */}
                  <div className="p-6 rounded-2xl bg-[#FFFFFF] border border-[#E8E8E8] space-y-3 shadow-xs">
                    <div className="flex items-center gap-2">
                      <ShieldCheck className="w-4 h-4 text-[#54232F]" />
                      <h3 className="text-xs font-bold uppercase tracking-wider text-[#111111]">
                        Verified Member Privileges
                      </h3>
                    </div>

                    <ul className="text-xs text-[#666666] space-y-2 leading-relaxed">
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="w-3.5 h-3.5 text-[#059669] shrink-0" />
                        <span>Pan-India Priority Dispatch via Shiprocket</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="w-3.5 h-3.5 text-[#059669] shrink-0" />
                        <span>Direct WhatsApp Concierge & Dietary Advice</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="w-3.5 h-3.5 text-[#059669] shrink-0" />
                        <span>Early Batch Allocation (Min. 6 months shelf life)</span>
                      </li>
                    </ul>

                    <div className="pt-2 border-t border-[#F5F5F5]">
                      <Link
                        href="/contact"
                        className="inline-flex items-center gap-1.5 text-xs font-bold text-[#111111] hover:text-[#54232F] transition-colors"
                      >
                        <span>Need Help? Contact Concierge</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </div>

                </div>

              </div>
            </div>
          )}

        </div>
      </main>

      {/* =========================================================================
          MODAL: ADD / EDIT ADDRESS
          ========================================================================= */}
      {showAddressModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-fadeIn">
          <div className="w-full max-w-lg bg-[#FAF6F0] border border-[#EADBCA] rounded-3xl p-6 sm:p-8 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <button
              type="button"
              onClick={() => setShowAddressModal(false)}
              className="absolute right-5 top-5 p-2 rounded-full hover:bg-[#EADBCA]/60 text-[#666666] hover:text-[#111111] transition-colors"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="space-y-1 pb-4 border-b border-[#EADBCA]">
              <h3 className="text-xl font-extrabold text-[#111111]">
                {editingAddressId ? "Edit Delivery Address" : "Add Delivery Address"}
              </h3>
              <p className="text-xs text-[#666666]">
                Address must have a valid 6-digit Indian PIN code and GST state code.
              </p>
            </div>

            <form onSubmit={handleSaveAddress} className="space-y-4 pt-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold uppercase tracking-wider text-[#111111]">
                    Full Name <span className="text-[#54232F]">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={addressForm.fullName}
                    onChange={(e) => setAddressForm({ ...addressForm, fullName: e.target.value })}
                    placeholder="Recipient's Name"
                    className="w-full px-3.5 py-2.5 bg-[#FFFFFF] border border-[#E5DAC8] rounded-xl text-xs text-[#111111] focus:outline-none focus:border-[#54232F]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold uppercase tracking-wider text-[#111111]">
                    Phone (10 Digits) <span className="text-[#54232F]">*</span>
                  </label>
                  <input
                    type="tel"
                    required
                    maxLength={10}
                    value={addressForm.phone}
                    onChange={(e) => setAddressForm({ ...addressForm, phone: e.target.value.replace(/\D/g, "") })}
                    placeholder="9876543210"
                    className="w-full px-3.5 py-2.5 bg-[#FFFFFF] border border-[#E5DAC8] rounded-xl text-xs text-[#111111] focus:outline-none focus:border-[#54232F]"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold uppercase tracking-wider text-[#111111]">
                  Street Address (Line 1) <span className="text-[#54232F]">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={addressForm.addressLine1}
                  onChange={(e) => setAddressForm({ ...addressForm, addressLine1: e.target.value })}
                  placeholder="Flat / House / Building / Street"
                  className="w-full px-3.5 py-2.5 bg-[#FFFFFF] border border-[#E5DAC8] rounded-xl text-xs text-[#111111] focus:outline-none focus:border-[#54232F]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold uppercase tracking-wider text-[#111111]">
                    Apartment / Area (Line 2)
                  </label>
                  <input
                    type="text"
                    value={addressForm.addressLine2}
                    onChange={(e) => setAddressForm({ ...addressForm, addressLine2: e.target.value })}
                    placeholder="Sector / Layout / Colony"
                    className="w-full px-3.5 py-2.5 bg-[#FFFFFF] border border-[#E5DAC8] rounded-xl text-xs text-[#111111] focus:outline-none focus:border-[#54232F]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold uppercase tracking-wider text-[#111111]">
                    Landmark
                  </label>
                  <input
                    type="text"
                    value={addressForm.landmark}
                    onChange={(e) => setAddressForm({ ...addressForm, landmark: e.target.value })}
                    placeholder="Near City Hospital"
                    className="w-full px-3.5 py-2.5 bg-[#FFFFFF] border border-[#E5DAC8] rounded-xl text-xs text-[#111111] focus:outline-none focus:border-[#54232F]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold uppercase tracking-wider text-[#111111]">
                    City <span className="text-[#54232F]">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={addressForm.city}
                    onChange={(e) => setAddressForm({ ...addressForm, city: e.target.value })}
                    placeholder="Mumbai"
                    className="w-full px-3.5 py-2.5 bg-[#FFFFFF] border border-[#E5DAC8] rounded-xl text-xs text-[#111111] focus:outline-none focus:border-[#54232F]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold uppercase tracking-wider text-[#111111]">
                    PIN Code <span className="text-[#54232F]">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={6}
                    value={addressForm.pincode}
                    onChange={(e) => setAddressForm({ ...addressForm, pincode: e.target.value.replace(/\D/g, "") })}
                    placeholder="400050"
                    className="w-full px-3.5 py-2.5 bg-[#FFFFFF] border border-[#E5DAC8] rounded-xl text-xs text-[#111111] font-mono focus:outline-none focus:border-[#54232F]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold uppercase tracking-wider text-[#111111]">
                    State (GST) <span className="text-[#54232F]">*</span>
                  </label>
                  <select
                    value={addressForm.stateCode}
                    onChange={(e) => {
                      const code = e.target.value;
                      const name = INDIAN_GST_STATE_CODES[code] || "";
                      setAddressForm({ ...addressForm, stateCode: code, state: name });
                    }}
                    className="w-full px-3 py-2.5 bg-[#FFFFFF] border border-[#E5DAC8] rounded-xl text-xs text-[#111111] focus:outline-none focus:border-[#54232F]"
                  >
                    {Object.entries(INDIAN_GST_STATE_CODES).map(([code, name]) => (
                      <option key={code} value={code}>
                        {name} ({code})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  id="defaultShipCheck"
                  type="checkbox"
                  checked={addressForm.isDefaultShipping}
                  onChange={(e) => setAddressForm({ ...addressForm, isDefaultShipping: e.target.checked })}
                  className="w-4 h-4 rounded border-[#E5DAC8] text-[#54232F] focus:ring-[#54232F]"
                />
                <label htmlFor="defaultShipCheck" className="text-xs text-[#555555] cursor-pointer">
                  Set as default shipping address
                </label>
              </div>

              {addressFormError && (
                <div className="p-3 bg-[#FDF2F2] border border-[#F8D7DA] rounded-xl text-xs text-[#9B1C1C] flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{addressFormError}</span>
                </div>
              )}

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#EADBCA]">
                <button
                  type="button"
                  onClick={() => setShowAddressModal(false)}
                  className="px-5 py-2.5 rounded-full border border-[#E5DAC8] text-xs font-bold uppercase tracking-wider text-[#666666] hover:bg-[#FFFFFF]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={addressActionLoading}
                  className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-[#111111] text-[#FFFFFF] text-xs font-bold uppercase tracking-wider hover:bg-[#333333] disabled:opacity-50"
                >
                  {addressActionLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <span>Save Address</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL: EDIT PROFILE
          ========================================================================= */}
      {showProfileModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-fadeIn">
          <div className="w-full max-w-md bg-[#FAF6F0] border border-[#EADBCA] rounded-3xl p-6 sm:p-8 shadow-2xl relative">
            <button
              type="button"
              onClick={() => setShowProfileModal(false)}
              className="absolute right-5 top-5 p-2 rounded-full hover:bg-[#EADBCA]/60 text-[#666666] hover:text-[#111111] transition-colors"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="space-y-1 pb-4 border-b border-[#EADBCA]">
              <h3 className="text-xl font-extrabold text-[#111111]">
                Edit Profile
              </h3>
              <p className="text-xs text-[#666666]">
                Update your contact details for delivery alerts.
              </p>
            </div>

            <form onSubmit={handleSaveProfile} className="space-y-4 pt-4">
              <div className="space-y-1">
                <label className="text-xs font-bold uppercase tracking-wider text-[#111111]">
                  First Name <span className="text-[#54232F]">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={profileForm.firstName}
                  onChange={(e) => setProfileForm({ ...profileForm, firstName: e.target.value })}
                  placeholder="First Name"
                  className="w-full px-3.5 py-2.5 bg-[#FFFFFF] border border-[#E5DAC8] rounded-xl text-xs text-[#111111] focus:outline-none focus:border-[#54232F]"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold uppercase tracking-wider text-[#111111]">
                  Last Name
                </label>
                <input
                  type="text"
                  value={profileForm.lastName}
                  onChange={(e) => setProfileForm({ ...profileForm, lastName: e.target.value })}
                  placeholder="Last Name"
                  className="w-full px-3.5 py-2.5 bg-[#FFFFFF] border border-[#E5DAC8] rounded-xl text-xs text-[#111111] focus:outline-none focus:border-[#54232F]"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold uppercase tracking-wider text-[#111111]">
                  Mobile Phone (10 Digits)
                </label>
                <input
                  type="tel"
                  maxLength={10}
                  value={profileForm.phone}
                  onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value.replace(/\D/g, "") })}
                  placeholder="9876543210"
                  className="w-full px-3.5 py-2.5 bg-[#FFFFFF] border border-[#E5DAC8] rounded-xl text-xs text-[#111111] focus:outline-none focus:border-[#54232F]"
                />
              </div>

              {profileError && (
                <div className="p-3 bg-[#FDF2F2] border border-[#F8D7DA] rounded-xl text-xs text-[#9B1C1C] flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{profileError}</span>
                </div>
              )}

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#EADBCA]">
                <button
                  type="button"
                  onClick={() => setShowProfileModal(false)}
                  className="px-5 py-2.5 rounded-full border border-[#E5DAC8] text-xs font-bold uppercase tracking-wider text-[#666666] hover:bg-[#FFFFFF]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={profileSaving}
                  className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-[#111111] text-[#FFFFFF] text-xs font-bold uppercase tracking-wider hover:bg-[#333333] disabled:opacity-50"
                >
                  {profileSaving ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <span>Save Changes</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
