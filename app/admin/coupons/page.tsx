'use client';

import React, { useEffect, useState } from 'react';
import {
  Tag,
  Plus,
  RefreshCw,
  AlertCircle,
  ToggleLeft,
  ToggleRight,
  Trash2,
  Calendar,
  Percent,
  IndianRupee,
  X,
  CheckCircle2,
} from 'lucide-react';

interface Coupon {
  code: string;
  description?: string;
  discountType: 'percentage' | 'flat';
  discountValue: number;
  maxDiscountAmountInPaise?: number;
  minOrderValueInPaise: number;
  maxUses?: number;
  currentUses: number;
  maxUsesPerCustomer?: number;
  firstTimeCustomerOnly: boolean;
  startDate?: any;
  endDate?: any;
  isActive: boolean;
}

export default function AdminCouponsPage() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // Form State
  const [code, setCode] = useState('');
  const [description, setDescription] = useState('');
  const [discountType, setDiscountType] = useState<'percentage' | 'flat'>('percentage');
  const [discountValue, setDiscountValue] = useState<number>(10);
  const [maxDiscountRupees, setMaxDiscountRupees] = useState<number | ''>(500);
  const [minOrderRupees, setMinOrderRupees] = useState<number>(1999);
  const [maxUses, setMaxUses] = useState<number | ''>('');
  const [maxUsesPerCustomer, setMaxUsesPerCustomer] = useState<number>(1);
  const [firstTimeOnly, setFirstTimeOnly] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const fetchCoupons = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/v1/admin/coupons');
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || 'Failed to load coupons');
      }
      setCoupons(json.data || []);
    } catch (err: any) {
      setError(err.message || 'Error fetching coupons');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCoupons();
  }, []);

  const handleToggleActive = async (coupon: Coupon) => {
    const updatedStatus = !coupon.isActive;
    try {
      const res = await fetch(`/api/v1/admin/coupons/${coupon.code}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: updatedStatus }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || 'Failed to update coupon');
      }
      setCoupons((prev) =>
        prev.map((c) => (c.code === coupon.code ? { ...c, isActive: updatedStatus } : c))
      );
    } catch (err: any) {
      alert(`Could not update coupon: ${err.message}`);
    }
  };

  const handleDelete = async (couponCode: string) => {
    if (!confirm(`Are you sure you want to delete coupon ${couponCode}?`)) return;

    try {
      const res = await fetch(`/api/v1/admin/coupons/${couponCode}`, {
        method: 'DELETE',
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || 'Failed to delete coupon');
      }
      setCoupons((prev) => prev.filter((c) => c.code !== couponCode));
    } catch (err: any) {
      alert(`Could not delete coupon: ${err.message}`);
    }
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const payload: any = {
        code: code.trim().toUpperCase(),
        description: description.trim() || undefined,
        discountType,
        discountValue: Number(discountValue),
        minOrderValueInPaise: Math.round(Number(minOrderRupees) * 100),
        firstTimeCustomerOnly: firstTimeOnly,
        maxUsesPerCustomer: Number(maxUsesPerCustomer) || 1,
        isActive: true,
      };

      if (discountType === 'percentage' && maxDiscountRupees !== '') {
        payload.maxDiscountAmountInPaise = Math.round(Number(maxDiscountRupees) * 100);
      }
      if (maxUses !== '') {
        payload.maxUses = Number(maxUses);
      }

      const res = await fetch('/api/v1/admin/coupons', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || 'Failed to create coupon');
      }

      alert(`Coupon ${payload.code} created successfully!`);
      setIsCreateModalOpen(false);
      setCode('');
      setDescription('');
      await fetchCoupons();
    } catch (err: any) {
      alert(`Error creating coupon: ${err.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-[#ECE6DE]">
        <div>
          <h1 className="text-2xl lg:text-3xl font-serif text-[#210D15] font-semibold tracking-tight">
            Promotional Coupons & Rules
          </h1>
          <p className="text-xs text-[#70675E] mt-1">
            Create percentage or flat rupee discounts, enforce caps and first-time buyer limits.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchCoupons}
            disabled={loading}
            className="p-2 border border-[#D5CCC1] rounded-md text-[#554E46] hover:bg-[#FFFFFF] transition"
            title="Refresh Coupons"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-[#210D15] text-[#FAF8F5] text-xs font-medium rounded-md hover:bg-[#321721] transition shadow-xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Create Coupon</span>
          </button>
        </div>
      </div>

      {/* Error state */}
      {error && (
        <div className="p-4 bg-[#FEE2E2] border border-[#FCA5A5] text-[#991B1B] rounded-md text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Coupons Table */}
      <div className="bg-[#FFFFFF] border border-[#E8E2D9] rounded-lg shadow-xs overflow-hidden">
        {loading ? (
          <div className="py-16 text-center text-xs text-[#70675E] space-y-2">
            <RefreshCw className="w-5 h-5 animate-spin mx-auto text-[#210D15]" />
            <p>Loading promo codes from Firestore...</p>
          </div>
        ) : coupons.length === 0 ? (
          <div className="py-16 text-center text-xs text-[#70675E] space-y-3">
            <Tag className="w-8 h-8 mx-auto text-[#C5BDB5]" />
            <p className="font-medium text-[#210D15]">No promotional coupons configured</p>
            <p className="text-[11px] text-[#8C827A]">Click "Create Coupon" to launch your first promotional campaign.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-[#2D2A26] min-w-[750px]">
              <thead className="bg-[#FAF8F5] border-b border-[#ECE6DE] text-[#696159] font-medium uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-3 px-4">Coupon Code</th>
                  <th className="py-3 px-4">Discount</th>
                  <th className="py-3 px-4">Min. Cart Value</th>
                  <th className="py-3 px-4">Redemptions</th>
                  <th className="py-3 px-4">Per User Limit</th>
                  <th className="py-3 px-4">Eligibility</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#ECE6DE]">
                {coupons.map((c) => {
                  return (
                    <tr key={c.code} className="hover:bg-[#FAF8F5]/80 transition">
                      {/* Code */}
                      <td className="py-3.5 px-4">
                        <span className="font-mono font-bold text-[#210D15] bg-[#F5F2EB] px-2.5 py-1 rounded border border-[#E8E2D9] tracking-wider">
                          {c.code}
                        </span>
                        {c.description && (
                          <p className="text-[10px] text-[#70675E] mt-1 max-w-xs truncate">{c.description}</p>
                        )}
                      </td>

                      {/* Discount Value */}
                      <td className="py-3.5 px-4">
                        <p className="font-semibold text-[#15803D]">
                          {c.discountType === 'percentage'
                            ? `${c.discountValue}% OFF`
                            : `₹${c.discountValue} FLAT OFF`}
                        </p>
                        {c.maxDiscountAmountInPaise && (
                          <p className="text-[10px] text-[#70675E]">
                            Max cap: ₹{(c.maxDiscountAmountInPaise / 100).toLocaleString('en-IN')}
                          </p>
                        )}
                      </td>

                      {/* Min Order Value */}
                      <td className="py-3.5 px-4 font-medium text-[#210D15]">
                        ₹{(((c.minOrderValueInPaise || 0) / 100)).toLocaleString('en-IN')}
                      </td>

                      {/* Current / Max Uses */}
                      <td className="py-3.5 px-4 text-[#554E46]">
                        <span className="font-semibold text-[#210D15]">{c.currentUses || 0}</span>
                        <span className="text-[#8C827A]"> / {c.maxUses ? c.maxUses : '∞'}</span>
                      </td>

                      {/* Per-user cap */}
                      <td className="py-3.5 px-4 text-[#70675E]">
                        {c.maxUsesPerCustomer ? `${c.maxUsesPerCustomer} time(s)` : 'Unlimited'}
                      </td>

                      {/* Eligibility */}
                      <td className="py-3.5 px-4">
                        {c.firstTimeCustomerOnly ? (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-[#FEF3C7] text-[#92400E]">
                            1st Order Only
                          </span>
                        ) : (
                          <span className="text-[11px] text-[#70675E]">All Customers</span>
                        )}
                      </td>

                      {/* Active Status */}
                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium ${
                            c.isActive
                              ? 'bg-[#DCFCE7] text-[#166534]'
                              : 'bg-[#F3F4F6] text-[#4B5563]'
                          }`}
                        >
                          {c.isActive ? 'Active' : 'Disabled'}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleToggleActive(c)}
                            className="p-1 border border-[#D5CCC1] rounded hover:bg-[#FAF8F5] transition text-[#554E46]"
                            title={c.isActive ? 'Disable Coupon' : 'Enable Coupon'}
                          >
                            {c.isActive ? (
                              <ToggleRight className="w-4 h-4 text-[#166534]" />
                            ) : (
                              <ToggleLeft className="w-4 h-4 text-[#8C827A]" />
                            )}
                          </button>
                          <button
                            onClick={() => handleDelete(c.code)}
                            className="p-1 border border-[#D5CCC1] rounded hover:bg-[#FEE2E2] transition text-[#991B1B]"
                            title="Delete Coupon"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create Coupon Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 bg-[#210D15]/50 flex items-center justify-center p-4">
          <div className="bg-[#FFFFFF] rounded-xl shadow-xl max-w-lg w-full border border-[#E8E2D9] max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-5 border-b border-[#ECE6DE]">
              <h3 className="font-serif font-bold text-lg text-[#210D15]">
                Create Promotional Coupon
              </h3>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="text-[#8C827A] hover:text-[#210D15] transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="p-5 space-y-4 text-xs">
              <div>
                <label className="block text-[#554E46] font-medium mb-1">Coupon Code (Uppercase)</label>
                <input
                  type="text"
                  value={code}
                  onChange={(e) => setCode(e.target.value.toUpperCase())}
                  placeholder="e.g. GUTGLOW15"
                  className="w-full px-3 py-2 border border-[#D5CCC1] rounded-md text-sm font-mono uppercase text-[#210D15] focus:outline-none focus:ring-1 focus:ring-[#210D15]"
                  required
                />
              </div>

              <div>
                <label className="block text-[#554E46] font-medium mb-1">Campaign Description</label>
                <input
                  type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="e.g. 15% OFF for founding wellness ritual cohort"
                  className="w-full px-3 py-2 border border-[#D5CCC1] rounded-md text-xs text-[#210D15] focus:outline-none focus:ring-1 focus:ring-[#210D15]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#554E46] font-medium mb-1">Discount Type</label>
                  <select
                    value={discountType}
                    onChange={(e) => setDiscountType(e.target.value as any)}
                    className="w-full px-3 py-2 border border-[#D5CCC1] rounded-md text-xs text-[#210D15] bg-[#FFFFFF] focus:outline-none focus:ring-1 focus:ring-[#210D15]"
                  >
                    <option value="percentage">Percentage (%)</option>
                    <option value="flat">Flat Rupee (₹)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[#554E46] font-medium mb-1">
                    {discountType === 'percentage' ? 'Percentage (e.g. 15)' : 'Flat Amount in ₹'}
                  </label>
                  <input
                    type="number"
                    value={discountValue}
                    onChange={(e) => setDiscountValue(Number(e.target.value))}
                    min={1}
                    max={discountType === 'percentage' ? 100 : 10000}
                    className="w-full px-3 py-2 border border-[#D5CCC1] rounded-md text-xs text-[#210D15] focus:outline-none focus:ring-1 focus:ring-[#210D15]"
                    required
                  />
                </div>
              </div>

              {discountType === 'percentage' && (
                <div>
                  <label className="block text-[#554E46] font-medium mb-1">Maximum Discount Cap in ₹ (Optional)</label>
                  <input
                    type="number"
                    value={maxDiscountRupees}
                    onChange={(e) => setMaxDiscountRupees(e.target.value === '' ? '' : Number(e.target.value))}
                    placeholder="e.g. 500 (Caps discount at ₹500)"
                    className="w-full px-3 py-2 border border-[#D5CCC1] rounded-md text-xs text-[#210D15] focus:outline-none focus:ring-1 focus:ring-[#210D15]"
                  />
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#554E46] font-medium mb-1">Min. Order Value (₹)</label>
                  <input
                    type="number"
                    value={minOrderRupees}
                    onChange={(e) => setMinOrderRupees(Number(e.target.value))}
                    min={0}
                    className="w-full px-3 py-2 border border-[#D5CCC1] rounded-md text-xs text-[#210D15] focus:outline-none focus:ring-1 focus:ring-[#210D15]"
                    required
                  />
                </div>

                <div>
                  <label className="block text-[#554E46] font-medium mb-1">Uses Per Customer</label>
                  <input
                    type="number"
                    value={maxUsesPerCustomer}
                    onChange={(e) => setMaxUsesPerCustomer(Number(e.target.value))}
                    min={1}
                    className="w-full px-3 py-2 border border-[#D5CCC1] rounded-md text-xs text-[#210D15] focus:outline-none focus:ring-1 focus:ring-[#210D15]"
                    required
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="firstTimeOnly"
                  checked={firstTimeOnly}
                  onChange={(e) => setFirstTimeOnly(e.target.checked)}
                  className="rounded border-[#D5CCC1] text-[#210D15] focus:ring-[#210D15]"
                />
                <label htmlFor="firstTimeOnly" className="text-xs text-[#554E46] font-medium">
                  First-Time Customers Only (Must have 0 prior orders)
                </label>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#ECE6DE]">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2 border border-[#D5CCC1] rounded-md text-[#554E46] hover:bg-[#FAF8F5] transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 bg-[#210D15] text-[#FAF8F5] font-medium rounded-md hover:bg-[#321721] transition disabled:opacity-50"
                >
                  {submitting ? 'Creating...' : 'Create Coupon'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
