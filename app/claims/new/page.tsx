'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { AnnouncementBar } from '@/components/layout/AnnouncementBar';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import {
  ShieldCheck,
  Package,
  AlertTriangle,
  Upload,
  CheckCircle2,
  Clock,
  Camera,
  Trash2,
  ArrowRight,
  Sparkles,
  HelpCircle,
  RotateCcw,
  AlertCircle,
  FileText,
} from 'lucide-react';
import type { EligibilityResult } from '@/lib/services/claimService';
import type { ReturnReason } from '@/types/firestore/store';

function ClaimsFormContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [step, setStep] = useState<'verify' | 'details' | 'success'>('verify');
  const [orderId, setOrderId] = useState(searchParams.get('orderId') || '');
  const [phone, setPhone] = useState(searchParams.get('phone') || '');
  const [isVerifying, setIsVerifying] = useState(false);
  const [verifyError, setVerifyError] = useState<string | null>(null);
  const [eligibilityData, setEligibilityData] = useState<EligibilityResult | null>(null);

  // Form State
  const [reason, setReason] = useState<ReturnReason>('damaged_in_transit');
  const [customerNotes, setCustomerNotes] = useState('');
  const [damagedImages, setDamagedImages] = useState<string[]>([]);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [createdClaimId, setCreatedClaimId] = useState<string | null>(null);

  // Auto-verify if prefilled from URL
  useEffect(() => {
    if (searchParams.get('orderId') && searchParams.get('phone')) {
      handleVerify(searchParams.get('orderId')!, searchParams.get('phone')!);
    }
  }, []);

  const handleVerify = async (orderToVerify: string, phoneToVerify: string) => {
    if (!orderToVerify.trim() || !phoneToVerify.trim()) {
      setVerifyError('Please enter both your Order ID and 10-digit mobile number.');
      return;
    }

    setIsVerifying(true);
    setVerifyError(null);

    try {
      const res = await fetch('/api/v1/claims/check-eligibility', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId: orderToVerify.trim(),
          customerPhone: phoneToVerify.trim(),
        }),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || 'Failed to verify order');
      }

      const result: EligibilityResult = json.data;
      if (!result.eligible) {
        setVerifyError(result.message);
        return;
      }

      setEligibilityData(result);
      setStep('details');
    } catch (err: any) {
      setVerifyError(err.message || 'Error verifying order eligibility');
    } finally {
      setIsVerifying(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileList = e.target.files;
    if (!fileList || fileList.length === 0) return;

    const files = Array.from(fileList);
    setUploadingImage(true);
    setSubmitError(null);

    try {
      const formData = new FormData();
      files.forEach((f) => formData.append('files', f));
      formData.append('folder', 'claims');

      const res = await fetch('/api/v1/admin/media/upload', {
        method: 'POST',
        body: formData,
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || 'Failed to upload photo evidence');
      }

      const uploadedUrls: string[] = Array.isArray(json.data?.files)
        ? json.data.files.map((f: any) => f.url)
        : json.data?.url
        ? [json.data.url]
        : [];

      setDamagedImages((prev) => [...prev, ...uploadedUrls]);
    } catch (err: any) {
      alert(`Upload error: ${err.message}`);
    } finally {
      setUploadingImage(false);
      e.target.value = '';
    }
  };

  const handleRemovePhoto = (index: number) => {
    setDamagedImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmitClaim = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!eligibilityData || !eligibilityData.order) return;

    if (damagedImages.length === 0) {
      setSubmitError('Please upload at least 1 photo showing the damaged parcel, broken seal, or courier packaging.');
      return;
    }

    if (customerNotes.trim().length < 10) {
      setSubmitError('Please describe the issue in at least 10 characters.');
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const payload = {
        orderId: eligibilityData.order.id,
        customerPhone: phone.trim(),
        customerEmail: eligibilityData.order.customer.email,
        reason,
        damagedImageUrls: damagedImages,
        customerNotes: customerNotes.trim(),
        items: eligibilityData.order.items.map((it) => ({
          baseSku: it.baseSku,
          packOptionId: it.packOptionId,
          packName: it.packName,
          physicalUnitsCount: it.quantity,
          reason,
        })),
      };

      const res = await fetch('/api/v1/claims/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || 'Failed to submit claim');
      }

      setCreatedClaimId(json.data?.id || 'CLM-CONFIRMED');
      setStep('success');
    } catch (err: any) {
      setSubmitError(err.message || 'Error submitting damage claim');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FDFBF7] flex flex-col font-sans">
      <AnnouncementBar />
      <Header />

      <main className="flex-1 py-12 px-4 sm:px-6 lg:px-8 max-w-3xl mx-auto w-full">
        {/* BRAND POLICY BADGE */}
        <div className="text-center space-y-3 mb-8">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#FAF6F0] border border-[#EADBCA] text-[#54232F] rounded-full text-xs font-semibold uppercase tracking-wider">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>FSSAI Quality & Hygiene Standard</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-serif text-[#171717] font-semibold tracking-tight">
            Transit Damage & Replacement Desk
          </h1>
          <p className="text-xs sm:text-sm text-[#666666] max-w-xl mx-auto leading-relaxed">
            As an ingestible botanical wellness formula, GutGlow products are non-returnable once delivered for food safety reasons. If your parcel suffered transit damage or seal breakage, file a claim below for a <strong className="text-[#171717]">100% Free Replacement Order</strong>.
          </p>
        </div>

        {/* STEP 1: VERIFY ORDER */}
        {step === 'verify' && (
          <div className="bg-[#FFFFFF] border border-[#E8E8E8] rounded-2xl p-6 sm:p-8 shadow-xs space-y-6">
            <div className="border-b border-[#F0F0F0] pb-4">
              <h2 className="text-base font-serif font-bold text-[#171717]">
                Step 1: Verify Order Delivery
              </h2>
              <p className="text-xs text-[#666666] mt-0.5">
                Claims must be filed within 48 hours of physical parcel delivery.
              </p>
            </div>

            {verifyError && (
              <div className="p-3.5 bg-[#FEE2E2] border border-[#FCA5A5] rounded-xl text-xs text-[#991B1B] flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span className="leading-relaxed">{verifyError}</span>
              </div>
            )}

            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleVerify(orderId, phone);
              }}
              className="space-y-4"
            >
              <div>
                <label className="block text-xs font-bold text-[#171717] uppercase tracking-wider mb-1.5">
                  Order Number *
                </label>
                <input
                  type="text"
                  required
                  value={orderId}
                  onChange={(e) => setOrderId(e.target.value.toUpperCase())}
                  placeholder="e.g. GG-2611-000001"
                  className="w-full px-4 py-3 bg-[#FAF8F5] border border-[#D5CCC1] rounded-xl text-sm font-mono text-[#171717] focus:bg-[#FFFFFF] focus:outline-none focus:ring-1 focus:ring-[#54232F]"
                />
                <p className="text-[11px] text-[#8C827A] mt-1">
                  Found in your order confirmation SMS, email, or invoice.
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#171717] uppercase tracking-wider mb-1.5">
                  10-Digit Mobile Number *
                </label>
                <input
                  type="tel"
                  required
                  maxLength={10}
                  value={phone}
                  onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                  placeholder="e.g. 9876543210"
                  className="w-full px-4 py-3 bg-[#FAF8F5] border border-[#D5CCC1] rounded-xl text-sm font-mono text-[#171717] focus:bg-[#FFFFFF] focus:outline-none focus:ring-1 focus:ring-[#54232F]"
                />
                <p className="text-[11px] text-[#8C827A] mt-1">
                  The phone number used when placing the order.
                </p>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isVerifying}
                  className="w-full py-3.5 bg-[#54232F] text-[#FAF8F5] text-xs font-bold uppercase tracking-wider rounded-xl hover:bg-[#3D1A27] transition shadow-xs disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isVerifying ? (
                    <>
                      <Sparkles className="w-4 h-4 animate-spin" />
                      <span>Verifying Delivery Status...</span>
                    </>
                  ) : (
                    <>
                      <span>Verify & Proceed to Claim</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </form>

            <div className="pt-4 border-t border-[#F0F0F0] text-center">
              <Link
                href="/track-order"
                className="text-xs text-[#666666] hover:text-[#171717] font-semibold underline"
              >
                Need to check delivery status first? Track Order here →
              </Link>
            </div>
          </div>
        )}

        {/* STEP 2: CLAIM DETAILS & PHOTO UPLOAD */}
        {step === 'details' && eligibilityData && eligibilityData.order && (
          <div className="bg-[#FFFFFF] border border-[#E8E8E8] rounded-2xl p-6 sm:p-8 shadow-xs space-y-6">
            <div className="border-b border-[#F0F0F0] pb-4 flex items-center justify-between">
              <div>
                <h2 className="text-base font-serif font-bold text-[#171717]">
                  Step 2: Submit Damage Proof
                </h2>
                <p className="text-xs text-[#666666] mt-0.5">
                  Order <strong className="text-[#171717] font-mono">{eligibilityData.order.id}</strong> • Delivered recently
                </p>
              </div>
              <span className="px-3 py-1 bg-[#DCFCE7] text-[#166534] border border-[#86EFAC] rounded-full text-[11px] font-bold flex items-center gap-1">
                <Clock className="w-3 h-3" />
                <span>{eligibilityData.order.hoursRemaining || 48}h Left in Window</span>
              </span>
            </div>

            {submitError && (
              <div className="p-3.5 bg-[#FEE2E2] border border-[#FCA5A5] rounded-xl text-xs text-[#991B1B] flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span className="leading-relaxed">{submitError}</span>
              </div>
            )}

            <form onSubmit={handleSubmitClaim} className="space-y-6">
              {/* REASON PICKER */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-[#171717] uppercase tracking-wider">
                  Type of Damage or Issue *
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <label
                    onClick={() => setReason('damaged_in_transit')}
                    className={`p-3.5 rounded-xl border cursor-pointer transition flex flex-col justify-between ${
                      reason === 'damaged_in_transit'
                        ? 'border-[#54232F] bg-[#FAF6F0] ring-1 ring-[#54232F]'
                        : 'border-[#E8E8E8] bg-[#FFFFFF] hover:bg-[#FAF8F5]'
                    }`}
                  >
                    <span className="text-xs font-bold text-[#171717] block">📦 Transit Damage</span>
                    <span className="text-[11px] text-[#666666] mt-1 block">
                      Crushed outer box, broken jar/pack, or leaking product.
                    </span>
                  </label>

                  <label
                    onClick={() => setReason('broken_seal')}
                    className={`p-3.5 rounded-xl border cursor-pointer transition flex flex-col justify-between ${
                      reason === 'broken_seal'
                        ? 'border-[#54232F] bg-[#FAF6F0] ring-1 ring-[#54232F]'
                        : 'border-[#E8E8E8] bg-[#FFFFFF] hover:bg-[#FAF8F5]'
                    }`}
                  >
                    <span className="text-xs font-bold text-[#171717] block">🔒 Broken Seal</span>
                    <span className="text-[11px] text-[#666666] mt-1 block">
                      Factory tamper-evident safety seal was open or cut upon arrival.
                    </span>
                  </label>

                  <label
                    onClick={() => setReason('incorrect_item')}
                    className={`p-3.5 rounded-xl border cursor-pointer transition flex flex-col justify-between ${
                      reason === 'incorrect_item'
                        ? 'border-[#54232F] bg-[#FAF6F0] ring-1 ring-[#54232F]'
                        : 'border-[#E8E8E8] bg-[#FFFFFF] hover:bg-[#FAF8F5]'
                    }`}
                  >
                    <span className="text-xs font-bold text-[#171717] block">🔄 Wrong Product</span>
                    <span className="text-[11px] text-[#666666] mt-1 block">
                      Delivered variant or supply pack does not match order.
                    </span>
                  </label>
                </div>
              </div>

              {/* PHOTO UPLOADER */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold text-[#171717] uppercase tracking-wider">
                    Upload Damage Evidence Photos *
                  </label>
                  <span className="text-[11px] text-[#666666]">
                    Min 1 Photo (Box label + damaged seal)
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {damagedImages.map((url, idx) => (
                    <div
                      key={idx}
                      className="aspect-square rounded-xl border border-[#D5CCC1] overflow-hidden bg-[#FAF8F5] relative group"
                    >
                      <img src={url} alt="Proof" className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => handleRemovePhoto(idx)}
                        className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-black/70 text-white flex items-center justify-center hover:bg-red-600 transition"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}

                  <label className="aspect-square rounded-xl border-2 border-dashed border-[#D5CCC1] hover:border-[#54232F] bg-[#FAF8F5]/60 hover:bg-[#FAF8F5] transition flex flex-col items-center justify-center p-3 text-center cursor-pointer">
                    <Camera className="w-6 h-6 text-[#70675E] mb-1" />
                    <span className="text-xs font-semibold text-[#171717]">
                      {uploadingImage ? 'Uploading...' : 'Add Photos'}
                    </span>
                    <span className="text-[10px] text-[#8C827A] mt-0.5">PNG, JPEG, WebP</span>
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={handleFileUpload}
                      disabled={uploadingImage}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>

              {/* DESCRIPTION TEXTAREA */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-[#171717] uppercase tracking-wider">
                  Describe What Happened *
                </label>
                <textarea
                  rows={3}
                  required
                  value={customerNotes}
                  onChange={(e) => setCustomerNotes(e.target.value)}
                  placeholder="e.g. When opening the outer courier polybag, the product seal was already torn and powder leaked into the box."
                  className="w-full px-4 py-3 bg-[#FAF8F5] border border-[#D5CCC1] rounded-xl text-xs text-[#171717] focus:bg-[#FFFFFF] focus:outline-none focus:ring-1 focus:ring-[#54232F]"
                />
              </div>

              {/* SUBMIT BUTTON */}
              <div className="pt-2 flex items-center justify-between gap-4">
                <button
                  type="button"
                  onClick={() => setStep('verify')}
                  className="px-4 py-2 text-xs font-semibold text-[#666666] hover:text-[#171717]"
                >
                  ← Back to Order
                </button>

                <button
                  type="submit"
                  disabled={isSubmitting || uploadingImage}
                  className="px-6 py-3.5 bg-[#54232F] text-[#FAF8F5] text-xs font-bold uppercase tracking-wider rounded-xl hover:bg-[#3D1A27] transition shadow-xs disabled:opacity-50 flex items-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <Sparkles className="w-4 h-4 animate-spin" />
                      <span>Submitting Claim...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Submit Replacement Claim</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* STEP 3: SUCCESS CONFIRMATION */}
        {step === 'success' && (
          <div className="bg-[#FFFFFF] border border-[#E8E8E8] rounded-2xl p-8 sm:p-10 shadow-xs text-center space-y-5">
            <div className="w-16 h-16 rounded-full bg-[#DCFCE7] border border-[#86EFAC] text-[#166534] flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div className="space-y-1">
              <h2 className="text-xl sm:text-2xl font-serif font-bold text-[#171717]">
                Claim Received: {createdClaimId}
              </h2>
              <p className="text-xs text-[#666666] max-w-md mx-auto">
                Thank you for submitting proof. Our Quality Inspection Team will review the parcel photos within <strong className="text-[#171717]">24 business hours</strong>.
              </p>
            </div>

            <div className="p-4 bg-[#FAF6F0] border border-[#EADBCA] rounded-xl text-xs text-left max-w-md mx-auto space-y-2">
              <p className="font-bold text-[#54232F]">What happens next?</p>
              <ul className="space-y-1.5 text-[#666666] text-[11px] list-disc list-inside">
                <li>Upon photo verification, a <strong className="text-[#171717]">100% Free Replacement Order</strong> will be automatically generated with ₹0 balance.</li>
                <li>You will receive SMS and email dispatch updates with the new courier AWB tracking link.</li>
                <li>You do not need to ship the damaged consumable unit back.</li>
              </ul>
            </div>

            <div className="pt-4 flex flex-wrap items-center justify-center gap-3">
              <Link
                href="/track-order"
                className="px-5 py-2.5 bg-[#54232F] text-[#FAF8F5] text-xs font-bold uppercase tracking-wider rounded-xl hover:bg-[#3D1A27] transition"
              >
                Track Your Orders
              </Link>
              <Link
                href="/"
                className="px-5 py-2.5 border border-[#D5CCC1] text-[#171717] text-xs font-bold uppercase tracking-wider rounded-xl hover:bg-[#FAF8F5] transition"
              >
                Return to Storefront
              </Link>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}

export default function ClaimsPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#FDFBF7]" />}>
      <ClaimsFormContent />
    </Suspense>
  );
}
