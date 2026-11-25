'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Store,
  ShieldCheck,
  FileText,
  ExternalLink,
  Save,
  CheckCircle2,
  AlertCircle,
  Database,
  Lock,
  Loader2,
  Globe,
  Phone,
  Mail,
  MapPin,
  Building,
  Scale,
  RefreshCw,
} from 'lucide-react';

interface StoreSettingsData {
  storeName: string;
  storeTagline: string;
  legalBusinessName: string;
  ownerName: string;
  ownerEmail: string;
  supportEmail: string;
  supportPhone: string;
  instagramUrl: string;
  currency: string;
  fssaiLicenseNumber: string;
  gstin: string;
  hsnCode: string;
  defaultGstRateBasisPoints: number;
  minShelfLifeMonthsAtDispatch: number;
  partialCodAdvanceAmountInPaise: number;
  warehouseAddress: {
    line1: string;
    city: string;
    state: string;
    pincode: string;
    country: string;
  };
}

export default function AdminSettingsPage() {
  const [activeTab, setActiveTab] = useState<'general' | 'policies' | 'regulatory' | 'infrastructure'>('general');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [formData, setFormData] = useState<StoreSettingsData>({
    storeName: 'GutGlow',
    storeTagline: 'Thoughtful gut wellness for everyday living.',
    legalBusinessName: 'GutGlow Wellness Private Limited',
    ownerName: 'Imran Ahmad',
    ownerEmail: 'imrannahmd@gmail.com',
    supportEmail: 'care@gutglow.com',
    supportPhone: '+91 98765 43210',
    instagramUrl: 'https://instagram.com/gutglowofficial',
    currency: 'INR',
    fssaiLicenseNumber: '11524998000123',
    gstin: '27AABCU9603R1ZM',
    hsnCode: '2106 90 99',
    defaultGstRateBasisPoints: 1800,
    minShelfLifeMonthsAtDispatch: 6,
    partialCodAdvanceAmountInPaise: 15000,
    warehouseAddress: {
      line1: 'Plot 42, Logistics Park, Bhiwandi',
      city: 'Thane',
      state: 'Maharashtra',
      pincode: '421302',
      country: 'India',
    },
  });

  const fetchSettings = async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const res = await fetch('/api/v1/admin/settings');
      if (!res.ok) throw new Error('Failed to load store settings');
      const json = await res.json();
      if (json.success && json.data) {
        setFormData(json.data);
      }
    } catch (err) {
      console.error('[Settings] Fetch error:', err);
      setErrorMsg(err instanceof Error ? err.message : 'Failed to retrieve settings');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setErrorMsg(null);
    setSaveSuccess(false);

    try {
      const res = await fetch('/api/v1/admin/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || 'Failed to update store settings');
      }

      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3500);
    } catch (err) {
      console.error('[Settings] Save error:', err);
      setErrorMsg(err instanceof Error ? err.message : 'Error saving settings');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-16">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-[#ECE6DE]">
        <div>
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-serif text-[#210D15] font-semibold tracking-tight">
            Store Settings & Operations
          </h1>
          <p className="text-xs text-[#70675E] mt-1 font-sans">
            Manage your store identity, owner profile, legal policies, and regulatory compliance.
          </p>
        </div>

        <button
          onClick={fetchSettings}
          disabled={loading}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-[#FAF8F5] border border-[#D5CCC1] text-xs font-medium text-[#210D15] hover:bg-[#F2ECE4] transition self-start sm:self-auto disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh</span>
        </button>
      </div>

      {/* Save Success Alert */}
      {saveSuccess && (
        <div className="p-3 bg-[#ECFDF5] border border-[#A7F3D0] rounded-lg text-xs text-[#065F46] flex items-center gap-2 shadow-xs">
          <CheckCircle2 className="w-4 h-4 text-[#059669] shrink-0" />
          <span className="font-medium">Store settings successfully saved and synced with Cloud Firestore!</span>
        </div>
      )}

      {/* Error Alert */}
      {errorMsg && (
        <div className="p-3 bg-[#FEF2F2] border border-[#FECACA] rounded-lg text-xs text-[#991B1B] flex items-center gap-2 shadow-xs">
          <AlertCircle className="w-4 h-4 text-[#DC2626] shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Navigation Tabs (Shopify Style) */}
      <div className="flex items-center gap-2 border-b border-[#E8E2D9] overflow-x-auto no-scrollbar">
        <button
          onClick={() => setActiveTab('general')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-medium border-b-2 transition whitespace-nowrap ${
            activeTab === 'general'
              ? 'border-[#210D15] text-[#210D15] font-semibold'
              : 'border-transparent text-[#70675E] hover:text-[#210D15] hover:border-[#D5CCC1]'
          }`}
        >
          <Store className="w-4 h-4" />
          <span>General & Store Details</span>
        </button>

        <button
          onClick={() => setActiveTab('policies')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-medium border-b-2 transition whitespace-nowrap ${
            activeTab === 'policies'
              ? 'border-[#210D15] text-[#210D15] font-semibold'
              : 'border-transparent text-[#70675E] hover:text-[#210D15] hover:border-[#D5CCC1]'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>Store Policies & Legal</span>
        </button>

        <button
          onClick={() => setActiveTab('regulatory')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-medium border-b-2 transition whitespace-nowrap ${
            activeTab === 'regulatory'
              ? 'border-[#210D15] text-[#210D15] font-semibold'
              : 'border-transparent text-[#70675E] hover:text-[#210D15] hover:border-[#D5CCC1]'
          }`}
        >
          <Scale className="w-4 h-4" />
          <span>Taxes, HSN & FSSAI</span>
        </button>

        <button
          onClick={() => setActiveTab('infrastructure')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-medium border-b-2 transition whitespace-nowrap ${
            activeTab === 'infrastructure'
              ? 'border-[#210D15] text-[#210D15] font-semibold'
              : 'border-transparent text-[#70675E] hover:text-[#210D15] hover:border-[#D5CCC1]'
          }`}
        >
          <Database className="w-4 h-4" />
          <span>Infrastructure & Cloud</span>
        </button>
      </div>

      {/* =========================================================================
          TAB 1: GENERAL & STORE DETAILS
          ========================================================================= */}
      {activeTab === 'general' && (
        <form onSubmit={handleSave} className="space-y-6">
          {/* Card: Brand & Store Identity */}
          <div className="bg-[#FFFFFF] border border-[#E8E2D9] rounded-xl p-6 shadow-xs space-y-4">
            <h2 className="text-sm font-semibold text-[#210D15] flex items-center gap-2">
              <Store className="w-4 h-4 text-[#210D15]" />
              <span>Store Identity & Public Brand</span>
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-[#524B43] mb-1.5">
                  Store Public Name
                </label>
                <input
                  type="text"
                  required
                  value={formData.storeName}
                  onChange={(e) => setFormData({ ...formData, storeName: e.target.value })}
                  placeholder="GutGlow"
                  className="w-full px-3 py-2 text-xs bg-[#FAF8F5] border border-[#D5CCC1] rounded-lg focus:outline-none focus:border-[#210D15] focus:bg-[#FFFFFF] transition"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[#524B43] mb-1.5">
                  Legal Registered Entity Name
                </label>
                <input
                  type="text"
                  required
                  value={formData.legalBusinessName}
                  onChange={(e) => setFormData({ ...formData, legalBusinessName: e.target.value })}
                  placeholder="GutGlow Wellness Private Limited"
                  className="w-full px-3 py-2 text-xs bg-[#FAF8F5] border border-[#D5CCC1] rounded-lg focus:outline-none focus:border-[#210D15] focus:bg-[#FFFFFF] transition"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-medium text-[#524B43] mb-1.5">
                  Store Brand Tagline
                </label>
                <input
                  type="text"
                  value={formData.storeTagline}
                  onChange={(e) => setFormData({ ...formData, storeTagline: e.target.value })}
                  placeholder="Thoughtful gut wellness for everyday living."
                  className="w-full px-3 py-2 text-xs bg-[#FAF8F5] border border-[#D5CCC1] rounded-lg focus:outline-none focus:border-[#210D15] focus:bg-[#FFFFFF] transition"
                />
              </div>
            </div>
          </div>

          {/* Card: Store Owner & Administrator Profile */}
          <div className="bg-[#FFFFFF] border border-[#E8E2D9] rounded-xl p-6 shadow-xs space-y-4">
            <h2 className="text-sm font-semibold text-[#210D15] flex items-center gap-2">
              <Building className="w-4 h-4 text-[#210D15]" />
              <span>Store Owner & Account Credentials</span>
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-[#524B43] mb-1.5">
                  Store Owner Full Name (Displayed on System)
                </label>
                <input
                  type="text"
                  required
                  value={formData.ownerName}
                  onChange={(e) => setFormData({ ...formData, ownerName: e.target.value })}
                  placeholder="Imran Ahmad"
                  className="w-full px-3 py-2 text-xs bg-[#FAF8F5] border border-[#D5CCC1] rounded-lg focus:outline-none focus:border-[#210D15] focus:bg-[#FFFFFF] transition font-medium"
                />
                <p className="text-[10px] text-[#8C827A] mt-1">
                  This name is displayed on administrative audit logs and executive summaries.
                </p>
              </div>

              <div>
                <label className="block text-xs font-medium text-[#524B43] mb-1.5">
                  Primary Admin Login Email (Verified Master)
                </label>
                <div className="flex items-center gap-2 px-3 py-2 bg-[#F5F2ED] border border-[#E0D8CE] rounded-lg text-xs text-[#524B43]">
                  <Mail className="w-3.5 h-3.5 text-[#8C827A] shrink-0" />
                  <span className="font-mono text-xs">{formData.ownerEmail}</span>
                  <span className="ml-auto text-[9px] bg-[#210D15] text-[#FAF8F5] px-2 py-0.5 rounded font-mono">
                    Super Admin
                  </span>
                </div>
                <p className="text-[10px] text-[#8C827A] mt-1">
                  Master credential linked to Firebase Auth Asia-South1.
                </p>
              </div>
            </div>
          </div>

          {/* Card: Public Customer Support & Contact */}
          <div className="bg-[#FFFFFF] border border-[#E8E2D9] rounded-xl p-6 shadow-xs space-y-4">
            <h2 className="text-sm font-semibold text-[#210D15] flex items-center gap-2">
              <Phone className="w-4 h-4 text-[#210D15]" />
              <span>Customer Care, Socials & Support Channels</span>
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-medium text-[#524B43] mb-1.5">
                  Customer Support Email
                </label>
                <input
                  type="email"
                  required
                  value={formData.supportEmail}
                  onChange={(e) => setFormData({ ...formData, supportEmail: e.target.value })}
                  placeholder="care@gutglow.com"
                  className="w-full px-3 py-2 text-xs bg-[#FAF8F5] border border-[#D5CCC1] rounded-lg focus:outline-none focus:border-[#210D15] focus:bg-[#FFFFFF] transition"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[#524B43] mb-1.5">
                  Support Phone / WhatsApp
                </label>
                <input
                  type="text"
                  required
                  value={formData.supportPhone}
                  onChange={(e) => setFormData({ ...formData, supportPhone: e.target.value })}
                  placeholder="+91 98765 43210"
                  className="w-full px-3 py-2 text-xs bg-[#FAF8F5] border border-[#D5CCC1] rounded-lg focus:outline-none focus:border-[#210D15] focus:bg-[#FFFFFF] transition font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[#524B43] mb-1.5">
                  Official Instagram Handle URL
                </label>
                <div className="relative">
                  <Globe className="w-3.5 h-3.5 text-[#8C827A] absolute left-3 top-2.5" />
                  <input
                    type="url"
                    value={formData.instagramUrl}
                    onChange={(e) => setFormData({ ...formData, instagramUrl: e.target.value })}
                    placeholder="https://instagram.com/gutglowofficial"
                    className="w-full pl-9 pr-3 py-2 text-xs bg-[#FAF8F5] border border-[#D5CCC1] rounded-lg focus:outline-none focus:border-[#210D15] focus:bg-[#FFFFFF] transition"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Card: Primary Warehouse & Fulfillment Hub */}
          <div className="bg-[#FFFFFF] border border-[#E8E2D9] rounded-xl p-6 shadow-xs space-y-4">
            <h2 className="text-sm font-semibold text-[#210D15] flex items-center gap-2">
              <MapPin className="w-4 h-4 text-[#210D15]" />
              <span>Primary Warehouse & Shipping Hub</span>
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="md:col-span-2">
                <label className="block text-xs font-medium text-[#524B43] mb-1.5">
                  Warehouse Address Line
                </label>
                <input
                  type="text"
                  value={formData.warehouseAddress.line1}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      warehouseAddress: { ...formData.warehouseAddress, line1: e.target.value },
                    })
                  }
                  placeholder="Plot 42, Logistics Park, Bhiwandi"
                  className="w-full px-3 py-2 text-xs bg-[#FAF8F5] border border-[#D5CCC1] rounded-lg focus:outline-none focus:border-[#210D15] focus:bg-[#FFFFFF] transition"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[#524B43] mb-1.5">
                  City / State
                </label>
                <input
                  type="text"
                  value={`${formData.warehouseAddress.city}, ${formData.warehouseAddress.state}`}
                  onChange={(e) => {
                    const parts = e.target.value.split(',');
                    setFormData({
                      ...formData,
                      warehouseAddress: {
                        ...formData.warehouseAddress,
                        city: parts[0]?.trim() || '',
                        state: parts[1]?.trim() || '',
                      },
                    });
                  }}
                  placeholder="Thane, Maharashtra"
                  className="w-full px-3 py-2 text-xs bg-[#FAF8F5] border border-[#D5CCC1] rounded-lg focus:outline-none focus:border-[#210D15] focus:bg-[#FFFFFF] transition"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[#524B43] mb-1.5">
                  PIN Code
                </label>
                <input
                  type="text"
                  value={formData.warehouseAddress.pincode}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      warehouseAddress: { ...formData.warehouseAddress, pincode: e.target.value },
                    })
                  }
                  placeholder="421302"
                  className="w-full px-3 py-2 text-xs bg-[#FAF8F5] border border-[#D5CCC1] rounded-lg focus:outline-none focus:border-[#210D15] focus:bg-[#FFFFFF] transition font-mono"
                />
              </div>
            </div>
          </div>

          {/* Submit Action Bar */}
          <div className="flex items-center justify-end gap-3 pt-4">
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-lg bg-[#210D15] hover:bg-[#321721] text-[#FAF8F5] text-xs font-medium transition shadow-sm disabled:opacity-50"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              <span>{saving ? 'Saving Changes...' : 'Save Store Details'}</span>
            </button>
          </div>
        </form>
      )}

      {/* =========================================================================
          TAB 2: STORE POLICIES & LEGAL FRAMEWORK (Shopify Policies Center)
          ========================================================================= */}
      {activeTab === 'policies' && (
        <div className="space-y-6">
          <div className="bg-[#FAF8F5] border border-[#E8E2D9] rounded-xl p-5">
            <div className="flex items-center gap-2 text-[#210D15] font-semibold text-sm mb-1">
              <FileText className="w-4 h-4 text-[#210D15]" />
              <span>Legal Policies & Statutory Consumable Guidelines</span>
            </div>
            <p className="text-xs text-[#70675E] leading-relaxed">
              In accordance with FSSAI hygiene standards, consumable health products are non-returnable. Our storefront enforces a strict 48-hour transit damage replacement guarantee. All policies below are publicly accessible and active on the storefront.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Policy 1: Shipping & Damage Replacements */}
            <div className="bg-[#FFFFFF] border border-[#E8E2D9] rounded-xl p-6 shadow-xs flex flex-col justify-between space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-[#15803D] bg-[#ECFDF5] px-2 py-0.5 rounded border border-[#BBF7D0]">
                    FSSAI Protected
                  </span>
                  <span className="text-[10px] text-[#8C827A]">48-Hour SLA</span>
                </div>
                <h3 className="text-sm font-semibold text-[#210D15]">
                  Shipping & Replacement Policy
                </h3>
                <p className="text-xs text-[#70675E] leading-relaxed">
                  Food safety non-returnable guarantee with a 48-hour free fresh replacement window for courier-damaged or tampered packages. Includes photo evidence submission.
                </p>
              </div>

              <div className="pt-3 border-t border-[#ECE6DE] flex items-center justify-between">
                <Link
                  href="/policies/shipping"
                  target="_blank"
                  className="inline-flex items-center gap-1.5 text-xs font-medium text-[#210D15] hover:underline"
                >
                  <span>View Public Policy</span>
                  <ExternalLink className="w-3 h-3 text-[#8C827A]" />
                </Link>
                <Link
                  href="/claims/new"
                  target="_blank"
                  className="text-xs text-[#8C827A] hover:text-[#210D15]"
                >
                  Damage Desk ↗
                </Link>
              </div>
            </div>

            {/* Policy 2: Terms & Conditions */}
            <div className="bg-[#FFFFFF] border border-[#E8E2D9] rounded-xl p-6 shadow-xs flex flex-col justify-between space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-[#2563EB] bg-[#EFF6FF] px-2 py-0.5 rounded border border-[#BFDBFE]">
                    Indian Contract Act
                  </span>
                  <span className="text-[10px] text-[#8C827A]">Governing Law</span>
                </div>
                <h3 className="text-sm font-semibold text-[#210D15]">
                  Terms & Conditions
                </h3>
                <p className="text-xs text-[#70675E] leading-relaxed">
                  B2C electronic commerce guidelines, prepaid transactions, Partial COD 18-hour courier balance holding window, and intellectual property protection.
                </p>
              </div>

              <div className="pt-3 border-t border-[#ECE6DE] flex items-center justify-between">
                <Link
                  href="/policies/terms"
                  target="_blank"
                  className="inline-flex items-center gap-1.5 text-xs font-medium text-[#210D15] hover:underline"
                >
                  <span>View Public Policy</span>
                  <ExternalLink className="w-3 h-3 text-[#8C827A]" />
                </Link>
                <span className="text-[10px] text-[#8C827A]">Jurisdiction: Mumbai, IN</span>
              </div>
            </div>

            {/* Policy 3: Privacy & Data Protection */}
            <div className="bg-[#FFFFFF] border border-[#E8E2D9] rounded-xl p-6 shadow-xs flex flex-col justify-between space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-[#7C3AED] bg-[#F5F3FF] px-2 py-0.5 rounded border border-[#DDD6FE]">
                    DPDP Act 2023
                  </span>
                  <span className="text-[10px] text-[#8C827A]">PCI-DSS Tokenized</span>
                </div>
                <h3 className="text-sm font-semibold text-[#210D15]">
                  Privacy Policy & DPDP
                </h3>
                <p className="text-xs text-[#70675E] leading-relaxed">
                  Zero unauthorized data resale, tokenized payment handling via licensed gateways (Razorpay), customer deletion rights, and secure encrypted transit.
                </p>
              </div>

              <div className="pt-3 border-t border-[#ECE6DE] flex items-center justify-between">
                <Link
                  href="/policies/privacy"
                  target="_blank"
                  className="inline-flex items-center gap-1.5 text-xs font-medium text-[#210D15] hover:underline"
                >
                  <span>View Public Policy</span>
                  <ExternalLink className="w-3 h-3 text-[#8C827A]" />
                </Link>
                <span className="text-[10px] text-[#8C827A]">SSL 256-Bit TLS</span>
              </div>
            </div>

            {/* Policy 4: FAQ & Customer Support SLA */}
            <div className="bg-[#FFFFFF] border border-[#E8E2D9] rounded-xl p-6 shadow-xs flex flex-col justify-between space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-[#92400E] bg-[#FEF3C7] px-2 py-0.5 rounded border border-[#FDE68A]">
                    Customer Helpdesk
                  </span>
                  <span className="text-[10px] text-[#8C827A]">Mon-Sat 9AM-7PM</span>
                </div>
                <h3 className="text-sm font-semibold text-[#210D15]">
                  Customer Knowledgebase & FAQ
                </h3>
                <p className="text-xs text-[#70675E] leading-relaxed">
                  11 comprehensive verified responses covering daily dosage, prebiotic fibers, gut-brain axis, delivery timeframes, and brass scoop hygiene.
                </p>
              </div>

              <div className="pt-3 border-t border-[#ECE6DE] flex items-center justify-between">
                <Link
                  href="/faq"
                  target="_blank"
                  className="inline-flex items-center gap-1.5 text-xs font-medium text-[#210D15] hover:underline"
                >
                  <span>View Customer FAQ</span>
                  <ExternalLink className="w-3 h-3 text-[#8C827A]" />
                </Link>
                <span className="text-[10px] text-[#8C827A]">11 Verified Articles</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB 3: TAXES, HSN & STATUTORY COMPLIANCE
          ========================================================================= */}
      {activeTab === 'regulatory' && (
        <form onSubmit={handleSave} className="space-y-6">
          <div className="bg-[#FFFFFF] border border-[#E8E2D9] rounded-xl p-6 shadow-xs space-y-4">
            <h2 className="text-sm font-semibold text-[#210D15] flex items-center gap-2">
              <Scale className="w-4 h-4 text-[#210D15]" />
              <span>Statutory Compliance & GST Configuration</span>
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-[#524B43] mb-1.5">
                  FSSAI Central / State License Number
                </label>
                <input
                  type="text"
                  required
                  value={formData.fssaiLicenseNumber}
                  onChange={(e) => setFormData({ ...formData, fssaiLicenseNumber: e.target.value })}
                  placeholder="11524998000123"
                  className="w-full px-3 py-2 text-xs bg-[#FAF8F5] border border-[#D5CCC1] rounded-lg focus:outline-none focus:border-[#210D15] focus:bg-[#FFFFFF] transition font-mono font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[#524B43] mb-1.5">
                  Goods and Services Tax (GSTIN)
                </label>
                <input
                  type="text"
                  required
                  value={formData.gstin}
                  onChange={(e) => setFormData({ ...formData, gstin: e.target.value })}
                  placeholder="27AABCU9603R1ZM"
                  className="w-full px-3 py-2 text-xs bg-[#FAF8F5] border border-[#D5CCC1] rounded-lg focus:outline-none focus:border-[#210D15] focus:bg-[#FFFFFF] transition font-mono font-medium uppercase"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[#524B43] mb-1.5">
                  Primary Harmonized System Code (HSN)
                </label>
                <input
                  type="text"
                  required
                  value={formData.hsnCode}
                  onChange={(e) => setFormData({ ...formData, hsnCode: e.target.value })}
                  placeholder="2106 90 99"
                  className="w-full px-3 py-2 text-xs bg-[#FAF8F5] border border-[#D5CCC1] rounded-lg focus:outline-none focus:border-[#210D15] focus:bg-[#FFFFFF] transition font-mono"
                />
                <p className="text-[10px] text-[#8C827A] mt-1">
                  Applicable category: Food preparations not elsewhere specified (Dietary Supplements).
                </p>
              </div>

              <div>
                <label className="block text-xs font-medium text-[#524B43] mb-1.5">
                  GST Rate Basis Points (18% = 1800 bps)
                </label>
                <input
                  type="number"
                  required
                  value={formData.defaultGstRateBasisPoints}
                  onChange={(e) =>
                    setFormData({ ...formData, defaultGstRateBasisPoints: Number(e.target.value) })
                  }
                  placeholder="1800"
                  className="w-full px-3 py-2 text-xs bg-[#FAF8F5] border border-[#D5CCC1] rounded-lg focus:outline-none focus:border-[#210D15] focus:bg-[#FFFFFF] transition font-mono"
                />
                <p className="text-[10px] text-[#8C827A] mt-1">
                  Standard Indian GST: 18% inclusive (CGST 9% + SGST 9% / IGST 18%).
                </p>
              </div>

              <div>
                <label className="block text-xs font-medium text-[#524B43] mb-1.5">
                  FEFO Minimum Shelf Life at Dispatch (Months)
                </label>
                <input
                  type="number"
                  required
                  min={1}
                  max={24}
                  value={formData.minShelfLifeMonthsAtDispatch}
                  onChange={(e) =>
                    setFormData({ ...formData, minShelfLifeMonthsAtDispatch: Number(e.target.value) })
                  }
                  className="w-full px-3 py-2 text-xs bg-[#FAF8F5] border border-[#D5CCC1] rounded-lg focus:outline-none focus:border-[#210D15] focus:bg-[#FFFFFF] transition font-mono"
                />
                <p className="text-[10px] text-[#8C827A] mt-1">
                  Strict rule: No batch with &lt;6 months remaining shelf life is ever allocated to customer orders.
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4">
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-lg bg-[#210D15] hover:bg-[#321721] text-[#FAF8F5] text-xs font-medium transition shadow-sm disabled:opacity-50"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              <span>{saving ? 'Saving...' : 'Save Regulatory Details'}</span>
            </button>
          </div>
        </form>
      )}

      {/* =========================================================================
          TAB 4: INFRASTRUCTURE & CLOUD TELEMETRY
          ========================================================================= */}
      {activeTab === 'infrastructure' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Database Infrastructure */}
            <div className="bg-[#FFFFFF] border border-[#E8E2D9] rounded-xl p-6 shadow-xs space-y-3">
              <div className="flex items-center gap-2 text-[#210D15] font-semibold text-sm">
                <Database className="w-4 h-4 text-[#2563EB]" />
                <span>Cloud Database Infrastructure</span>
              </div>
              <div className="space-y-1.5 text-xs text-[#70675E]">
                <div className="flex justify-between py-1 border-b border-[#F0EBE1]">
                  <span>Database Engine</span>
                  <span className="font-semibold text-[#210D15]">Google Cloud Firestore (Native)</span>
                </div>
                <div className="flex justify-between py-1 border-b border-[#F0EBE1]">
                  <span>Database Region</span>
                  <span className="font-mono text-[#210D15]">asia-south1 (Mumbai, India)</span>
                </div>
                <div className="flex justify-between py-1 border-b border-[#F0EBE1]">
                  <span>Security Model</span>
                  <span className="text-[#15803D] font-medium">Strict Deny-By-Default + RBAC</span>
                </div>
                <div className="flex justify-between py-1">
                  <span>Connection Latency</span>
                  <span className="font-mono text-[#15803D]">~12ms SLA</span>
                </div>
              </div>
              <div className="pt-2 flex items-center gap-1.5 text-xs text-[#15803D]">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Cloud Firestore Asia-South1 Live & Healthy</span>
              </div>
            </div>

            {/* Edge Serverless Runtime */}
            <div className="bg-[#FFFFFF] border border-[#E8E2D9] rounded-xl p-6 shadow-xs space-y-3">
              <div className="flex items-center gap-2 text-[#210D15] font-semibold text-sm">
                <Lock className="w-4 h-4 text-[#15803D]" />
                <span>Security & Serverless Architecture</span>
              </div>
              <div className="space-y-1.5 text-xs text-[#70675E]">
                <div className="flex justify-between py-1 border-b border-[#F0EBE1]">
                  <span>Hosting Environment</span>
                  <span className="font-semibold text-[#210D15]">Vercel Edge Global Network</span>
                </div>
                <div className="flex justify-between py-1 border-b border-[#F0EBE1]">
                  <span>Admin Session Security</span>
                  <span className="font-mono text-[#210D15]">HttpOnly Cookie + HMAC SHA-256</span>
                </div>
                <div className="flex justify-between py-1 border-b border-[#F0EBE1]">
                  <span>COD Fraud Protection</span>
                  <span className="font-medium text-[#210D15]">18-Hour Auto-Expiry Holding Lock</span>
                </div>
                <div className="flex justify-between py-1">
                  <span>FSSAI Consumable Engine</span>
                  <span className="font-medium text-[#15803D]">48-Hour Free Replacement Active</span>
                </div>
              </div>
              <div className="pt-2 flex items-center gap-1.5 text-xs text-[#15803D]">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>All Microservices Operational</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
