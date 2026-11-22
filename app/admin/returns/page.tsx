'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  RotateCcw,
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Eye,
  Search,
  Filter,
  ArrowRight,
  Package,
  Calendar,
  Phone,
  Mail,
  Camera,
  ExternalLink,
  Sparkles,
  Check,
  RefreshCw,
  Clock,
  ChevronRight,
  AlertCircle,
} from 'lucide-react';
import type { FirestoreReturn, ReturnStatus, ReturnReason } from '@/types/firestore/store';
import type { FirestoreOrder } from '@/types/firestore/order';

interface ClaimWithOrders {
  claim: FirestoreReturn;
  order: FirestoreOrder | null;
  replacementOrder: FirestoreOrder | null;
}

export default function AdminReturnsPage() {
  const [claims, setClaims] = useState<FirestoreReturn[]>([]);
  const [counts, setCounts] = useState({
    all: 0,
    requested: 0,
    approved: 0,
    rejected: 0,
    completed: 0,
  });
  const [activeTab, setActiveTab] = useState<'all' | 'requested' | 'approved' | 'rejected'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Inspection Drawer / Modal State
  const [selectedClaimId, setSelectedClaimId] = useState<string | null>(null);
  const [inspectData, setInspectData] = useState<ClaimWithOrders | null>(null);
  const [inspectLoading, setInspectLoading] = useState(false);
  const [inspectError, setInspectError] = useState<string | null>(null);

  // Review Actions State
  const [actionInProgress, setActionInProgress] = useState(false);
  const [adminNotes, setAdminNotes] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');
  const [showRejectBox, setShowRejectBox] = useState(false);
  const [activePhotoModal, setActivePhotoModal] = useState<string | null>(null);
  const [successToast, setSuccessToast] = useState<string | null>(null);

  const fetchClaims = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (activeTab !== 'all') params.append('status', activeTab);
      if (searchQuery.trim()) params.append('search', searchQuery.trim());

      const res = await fetch(`/api/v1/admin/returns?${params.toString()}`);
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || 'Failed to fetch transit claims');
      }

      setClaims(json.data || []);
      if (json.counts) {
        setCounts(json.counts);
      }
    } catch (err: any) {
      setError(err.message || 'Error loading claims');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClaims();
  }, [activeTab]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchClaims();
  };

  const openInspection = async (claimId: string) => {
    setSelectedClaimId(claimId);
    setInspectLoading(true);
    setInspectError(null);
    setAdminNotes('');
    setRejectionReason('');
    setShowRejectBox(false);

    try {
      const res = await fetch(`/api/v1/admin/returns/${claimId}`);
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || 'Failed to fetch claim details');
      }
      setInspectData(json.data);
    } catch (err: any) {
      setInspectError(err.message || 'Failed to load claim');
    } finally {
      setInspectLoading(false);
    }
  };

  const closeInspection = () => {
    setSelectedClaimId(null);
    setInspectData(null);
    setInspectError(null);
  };

  const handleApproveReplacement = async () => {
    if (!selectedClaimId) return;
    if (!confirm('Approve this damage claim and immediately dispatch a 100% Free Replacement Order?')) {
      return;
    }

    setActionInProgress(true);
    try {
      const res = await fetch(`/api/v1/admin/returns/${selectedClaimId}/inspect`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'approve_replacement',
          adminNotes: adminNotes.trim(),
        }),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || 'Failed to approve replacement');
      }

      setSuccessToast(
        `Replacement Order #${json.replacementOrderId} generated successfully! Ready for packaging.`
      );
      setTimeout(() => setSuccessToast(null), 5000);

      // Refresh claim inspection and list
      await openInspection(selectedClaimId);
      fetchClaims();
    } catch (err: any) {
      alert(`Approval error: ${err.message}`);
    } finally {
      setActionInProgress(false);
    }
  };

  const handleRejectClaim = async () => {
    if (!selectedClaimId) return;
    if (!rejectionReason.trim()) {
      alert('Please specify the reason for rejecting this claim (e.g. proof does not show seal damage).');
      return;
    }

    setActionInProgress(true);
    try {
      const res = await fetch(`/api/v1/admin/returns/${selectedClaimId}/inspect`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'reject',
          rejectionReason: rejectionReason.trim(),
          adminNotes: adminNotes.trim(),
        }),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || 'Failed to reject claim');
      }

      setSuccessToast('Claim rejected.');
      setTimeout(() => setSuccessToast(null), 4000);

      await openInspection(selectedClaimId);
      fetchClaims();
    } catch (err: any) {
      alert(`Rejection error: ${err.message}`);
    } finally {
      setActionInProgress(false);
    }
  };

  const getReasonLabel = (reason: ReturnReason) => {
    switch (reason) {
      case 'damaged_in_transit':
        return { label: 'Damaged in Transit', color: 'bg-[#FEF3C7] text-[#92400E] border-[#FDE68A]' };
      case 'broken_seal':
        return { label: 'Factory Seal Broken', color: 'bg-[#FEE2E2] text-[#991B1B] border-[#FECACA]' };
      case 'incorrect_item':
        return { label: 'Incorrect Item Delivered', color: 'bg-[#DBEAFE] text-[#1E40AF] border-[#BFDBFE]' };
      default:
        return { label: 'Transit Issue', color: 'bg-[#F3F4F6] text-[#374151] border-[#E5E7EB]' };
    }
  };

  const getStatusBadge = (status: ReturnStatus) => {
    switch (status) {
      case 'requested':
      case 'inspection_pending':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-[#FEF3C7] text-[#92400E] border border-[#FDE68A]">
            <Clock className="w-3 h-3" />
            <span>Needs Review</span>
          </span>
        );
      case 'approved':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-[#DCFCE7] text-[#166534] border border-[#86EFAC]">
            <CheckCircle2 className="w-3 h-3" />
            <span>Replacement Approved</span>
          </span>
        );
      case 'rejected':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-[#FEE2E2] text-[#991B1B] border border-[#FCA5A5]">
            <XCircle className="w-3 h-3" />
            <span>Rejected</span>
          </span>
        );
      case 'completed':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-[#F3F4F6] text-[#4B5563] border border-[#E5E7EB]">
            <Check className="w-3 h-3" />
            <span>Completed</span>
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-[#F3F4F6] text-[#4B5563]">
            {status}
          </span>
        );
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-[#ECE6DE]">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl lg:text-3xl font-serif text-[#210D15] font-bold tracking-tight">
              Transit Claims & Replacements
            </h1>
            <span className="px-2 py-0.5 bg-[#FAF8F5] border border-[#D5CCC1] text-[#210D15] rounded text-[10px] font-mono font-bold">
              FOOD SAFETY COMPLIANT
            </span>
          </div>
          <p className="text-xs text-[#70675E] mt-1">
            Consumable wellness protection console. Inspect courier damage photos, broken seals, and dispatch free replacement parcels.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={fetchClaims}
            className="p-2 border border-[#D5CCC1] rounded-md text-[#554E46] hover:bg-[#FFFFFF] hover:text-[#210D15] transition"
            title="Refresh Claims"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* METRIC COUNTERS */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div
          onClick={() => setActiveTab('requested')}
          className={`p-4 rounded-xl border transition cursor-pointer ${
            activeTab === 'requested'
              ? 'bg-[#FFFFFF] border-[#210D15] shadow-xs'
              : 'bg-[#FAF8F5] border-[#ECE6DE] hover:bg-[#FFFFFF]'
          }`}
        >
          <div className="flex items-center justify-between text-xs text-[#70675E]">
            <span className="font-semibold uppercase tracking-wider text-[10px]">Pending Review</span>
            <AlertTriangle className="w-4 h-4 text-[#D97706]" />
          </div>
          <p className="text-2xl font-serif font-bold text-[#210D15] mt-2">{counts.requested}</p>
          <p className="text-[10px] text-[#70675E] mt-0.5">Awaiting damage photo inspection</p>
        </div>

        <div
          onClick={() => setActiveTab('approved')}
          className={`p-4 rounded-xl border transition cursor-pointer ${
            activeTab === 'approved'
              ? 'bg-[#FFFFFF] border-[#210D15] shadow-xs'
              : 'bg-[#FAF8F5] border-[#ECE6DE] hover:bg-[#FFFFFF]'
          }`}
        >
          <div className="flex items-center justify-between text-xs text-[#70675E]">
            <span className="font-semibold uppercase tracking-wider text-[10px]">Approved Replacements</span>
            <CheckCircle2 className="w-4 h-4 text-[#16A34A]" />
          </div>
          <p className="text-2xl font-serif font-bold text-[#15803D] mt-2">{counts.approved}</p>
          <p className="text-[10px] text-[#70675E] mt-0.5">Free replacement dispatched</p>
        </div>

        <div
          onClick={() => setActiveTab('rejected')}
          className={`p-4 rounded-xl border transition cursor-pointer ${
            activeTab === 'rejected'
              ? 'bg-[#FFFFFF] border-[#210D15] shadow-xs'
              : 'bg-[#FAF8F5] border-[#ECE6DE] hover:bg-[#FFFFFF]'
          }`}
        >
          <div className="flex items-center justify-between text-xs text-[#70675E]">
            <span className="font-semibold uppercase tracking-wider text-[10px]">Rejected Claims</span>
            <XCircle className="w-4 h-4 text-[#DC2626]" />
          </div>
          <p className="text-2xl font-serif font-bold text-[#991B1B] mt-2">{counts.rejected}</p>
          <p className="text-[10px] text-[#70675E] mt-0.5">Window expired or invalid proof</p>
        </div>

        <div
          onClick={() => setActiveTab('all')}
          className={`p-4 rounded-xl border transition cursor-pointer ${
            activeTab === 'all'
              ? 'bg-[#FFFFFF] border-[#210D15] shadow-xs'
              : 'bg-[#FAF8F5] border-[#ECE6DE] hover:bg-[#FFFFFF]'
          }`}
        >
          <div className="flex items-center justify-between text-xs text-[#70675E]">
            <span className="font-semibold uppercase tracking-wider text-[10px]">Total Claims Filed</span>
            <RotateCcw className="w-4 h-4 text-[#210D15]" />
          </div>
          <p className="text-2xl font-serif font-bold text-[#210D15] mt-2">{counts.all}</p>
          <p className="text-[10px] text-[#70675E] mt-0.5">All-time lifetime records</p>
        </div>
      </div>

      {/* POLICY NOTICE BANNER */}
      <div className="p-3.5 bg-[#FAF8F5] border border-[#E8E2D9] rounded-lg text-xs flex items-start gap-3">
        <ShieldCheck className="w-4 h-4 text-[#210D15] shrink-0 mt-0.5" />
        <div className="space-y-0.5">
          <p className="font-bold text-[#210D15]">
            Strict Consumable Non-Returnable Architecture
          </p>
          <p className="text-[11px] text-[#70675E] leading-relaxed">
            In compliance with FSSAI regulations, GutGlow products are non-returnable once successfully delivered. Approved claims generate a 100% Free Replacement Order for the customer, while the damaged unit is marked as a physical warehouse write-off (never restocked).
          </p>
        </div>
      </div>

      {/* TOAST NOTIFICATION */}
      {successToast && (
        <div className="p-3 bg-[#DCFCE7] border border-[#86EFAC] text-[#166534] rounded-md text-xs flex items-center gap-2">
          <Check className="w-4 h-4 shrink-0" />
          <span>{successToast}</span>
        </div>
      )}

      {/* SEARCH & FILTER CONTROLS */}
      <div className="bg-[#FFFFFF] border border-[#E8E2D9] rounded-lg p-3 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-xs">
        {/* TABS */}
        <div className="flex items-center gap-1 bg-[#FAF8F5] p-1 rounded-md border border-[#ECE6DE] w-full sm:w-auto">
          <button
            type="button"
            onClick={() => setActiveTab('all')}
            className={`px-3 py-1 text-xs font-semibold rounded transition ${
              activeTab === 'all'
                ? 'bg-[#FFFFFF] text-[#210D15] shadow-xs'
                : 'text-[#70675E] hover:text-[#210D15]'
            }`}
          >
            All Claims ({counts.all})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('requested')}
            className={`px-3 py-1 text-xs font-semibold rounded transition ${
              activeTab === 'requested'
                ? 'bg-[#FFFFFF] text-[#210D15] shadow-xs'
                : 'text-[#70675E] hover:text-[#210D15]'
            }`}
          >
            Needs Review ({counts.requested})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('approved')}
            className={`px-3 py-1 text-xs font-semibold rounded transition ${
              activeTab === 'approved'
                ? 'bg-[#FFFFFF] text-[#210D15] shadow-xs'
                : 'text-[#70675E] hover:text-[#210D15]'
            }`}
          >
            Approved ({counts.approved})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('rejected')}
            className={`px-3 py-1 text-xs font-semibold rounded transition ${
              activeTab === 'rejected'
                ? 'bg-[#FFFFFF] text-[#210D15] shadow-xs'
                : 'text-[#70675E] hover:text-[#210D15]'
            }`}
          >
            Rejected ({counts.rejected})
          </button>
        </div>

        {/* SEARCH INPUT */}
        <form onSubmit={handleSearchSubmit} className="relative w-full sm:w-72">
          <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-[#8C827A]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search Claim ID, Order, Phone..."
            className="w-full pl-8 pr-3 py-1.5 text-xs bg-[#FAF8F5] border border-[#D5CCC1] rounded-md text-[#2D2A26] placeholder-[#8C827A] focus:outline-none focus:bg-[#FFFFFF] focus:ring-1 focus:ring-[#210D15]"
          />
        </form>
      </div>

      {/* CLAIMS TABLE */}
      <div className="bg-[#FFFFFF] border border-[#E8E2D9] rounded-lg shadow-xs overflow-hidden">
        {loading ? (
          <div className="py-20 text-center text-xs text-[#70675E] space-y-2">
            <Sparkles className="w-5 h-5 animate-spin mx-auto text-[#210D15]" />
            <p className="font-medium text-[#210D15]">Loading claims registry...</p>
          </div>
        ) : error ? (
          <div className="p-8 text-center text-xs text-[#991B1B] space-y-2">
            <AlertCircle className="w-6 h-6 mx-auto text-[#DC2626]" />
            <p className="font-semibold">{error}</p>
            <button
              onClick={fetchClaims}
              className="px-3 py-1 bg-[#FAF8F5] border border-[#D5CCC1] rounded text-[#210D15] hover:bg-[#EBE4DC]"
            >
              Retry
            </button>
          </div>
        ) : claims.length === 0 ? (
          <div className="py-16 text-center space-y-3">
            <div className="w-12 h-12 bg-[#FAF8F5] border border-[#ECE6DE] rounded-full flex items-center justify-center mx-auto text-[#70675E]">
              <ShieldCheck className="w-6 h-6 text-[#15803D]" />
            </div>
            <h3 className="text-sm font-bold text-[#210D15]">Zero Active Damage Claims</h3>
            <p className="text-xs text-[#70675E] max-w-sm mx-auto">
              No transit damage or seal breakage claims recorded for this filter. All parcels are arriving safely.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#FAF8F5] text-[#70675E] uppercase text-[10px] tracking-wider border-b border-[#ECE6DE]">
                <tr>
                  <th className="py-3 px-4 font-semibold">Claim & Order ID</th>
                  <th className="py-3 px-4 font-semibold">Customer</th>
                  <th className="py-3 px-4 font-semibold">Issue Reason</th>
                  <th className="py-3 px-4 font-semibold">Proof Photos</th>
                  <th className="py-3 px-4 font-semibold">Submitted</th>
                  <th className="py-3 px-4 font-semibold">Status</th>
                  <th className="py-3 px-4 font-semibold text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#ECE6DE]">
                {claims.map((claim) => {
                  const reason = getReasonLabel(claim.items?.[0]?.reason || 'damaged_in_transit');
                  const dateStr = claim.createdAt
                    ? new Date(
                        typeof claim.createdAt === 'number'
                          ? claim.createdAt
                          : (claim.createdAt as any).seconds
                          ? (claim.createdAt as any).seconds * 1000
                          : (claim.createdAt as any)._seconds
                          ? (claim.createdAt as any)._seconds * 1000
                          : String(claim.createdAt)
                      ).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        hour: '2-digit',
                        minute: '2-digit',
                      })
                    : 'Recent';

                  return (
                    <tr
                      key={claim.id}
                      className="hover:bg-[#FAF8F5]/80 transition cursor-pointer"
                      onClick={() => openInspection(claim.id)}
                    >
                      <td className="py-3 px-4">
                        <div className="space-y-0.5">
                          <span className="font-mono font-bold text-[#210D15] block">
                            {claim.id}
                          </span>
                          <span className="text-[11px] font-mono text-[#70675E]">
                            Order: {claim.orderId}
                          </span>
                        </div>
                      </td>

                      <td className="py-3 px-4">
                        <div className="space-y-0.5">
                          <p className="font-semibold text-[#210D15]">
                            {claim.customerName || 'Customer'}
                          </p>
                          <p className="text-[11px] text-[#70675E] font-mono">
                            {claim.customerPhone || '—'}
                          </p>
                        </div>
                      </td>

                      <td className="py-3 px-4">
                        <span
                          className={`inline-block px-2 py-0.5 rounded text-[10px] font-semibold border ${reason.color}`}
                        >
                          {reason.label}
                        </span>
                      </td>

                      <td className="py-3 px-4">
                        <div className="flex items-center gap-1.5">
                          <Camera className="w-3.5 h-3.5 text-[#70675E]" />
                          <span className="font-semibold text-[#210D15]">
                            {claim.damagedImageUrls?.length || 0} photo(s)
                          </span>
                        </div>
                      </td>

                      <td className="py-3 px-4 text-[#70675E] text-[11px]">
                        {dateStr}
                      </td>

                      <td className="py-3 px-4">
                        {getStatusBadge(claim.status)}
                      </td>

                      <td className="py-3 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                        <button
                          type="button"
                          onClick={() => openInspection(claim.id)}
                          className="inline-flex items-center gap-1 px-3 py-1 bg-[#FAF8F5] border border-[#D5CCC1] text-[#210D15] rounded text-xs font-semibold hover:bg-[#210D15] hover:text-[#FAF8F5] transition"
                        >
                          <span>Inspect</span>
                          <ChevronRight className="w-3 h-3" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* SLIDE-OVER INSPECTION MODAL */}
      {selectedClaimId && (
        <div className="fixed inset-0 z-50 overflow-hidden bg-black/50 backdrop-blur-xs flex justify-end animate-in fade-in duration-150">
          <div className="w-full max-w-2xl bg-[#FFFFFF] h-full shadow-2xl flex flex-col justify-between overflow-y-auto border-l border-[#D5CCC1]">
            {/* MODAL HEADER */}
            <div className="p-5 border-b border-[#ECE6DE] flex items-center justify-between bg-[#FAF8F5]">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-serif font-bold text-[#210D15]">
                    Damage Inspection: {selectedClaimId}
                  </h2>
                  {inspectData && getStatusBadge(inspectData.claim.status)}
                </div>
                <p className="text-xs text-[#70675E] mt-0.5">
                  Verify photo proof before approving free replacement order.
                </p>
              </div>
              <button
                type="button"
                onClick={closeInspection}
                className="p-2 text-[#70675E] hover:text-[#210D15] hover:bg-[#EBE4DC] rounded-md transition"
              >
                ✕
              </button>
            </div>

            {/* MODAL BODY */}
            <div className="p-6 space-y-6 flex-1">
              {inspectLoading ? (
                <div className="py-24 text-center text-xs text-[#70675E] space-y-2">
                  <Sparkles className="w-5 h-5 animate-spin mx-auto text-[#210D15]" />
                  <p>Loading full evidence package and order details...</p>
                </div>
              ) : inspectError ? (
                <div className="p-4 bg-[#FEE2E2] text-[#991B1B] rounded text-xs">
                  {inspectError}
                </div>
              ) : inspectData ? (
                <>
                  {/* EVIDENCE GALLERY (PROOF PHOTOS) */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h3 className="text-xs font-bold uppercase tracking-wider text-[#210D15] flex items-center gap-1.5">
                        <Camera className="w-4 h-4 text-[#70675E]" />
                        <span>Submitted Proof Evidence ({inspectData.claim.damagedImageUrls?.length || 0} Photos)</span>
                      </h3>
                      <span className="text-[11px] text-[#70675E]">
                        Click any photo to enlarge
                      </span>
                    </div>

                    {inspectData.claim.damagedImageUrls && inspectData.claim.damagedImageUrls.length > 0 ? (
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                        {inspectData.claim.damagedImageUrls.map((url, idx) => (
                          <div
                            key={idx}
                            onClick={() => setActivePhotoModal(url)}
                            className="aspect-square rounded-lg border border-[#D5CCC1] overflow-hidden bg-[#FAF8F5] relative group cursor-pointer hover:ring-2 hover:ring-[#210D15] transition"
                          >
                            <img
                              src={url}
                              alt={`Damage proof ${idx + 1}`}
                              className="w-full h-full object-cover group-hover:scale-105 transition duration-200"
                            />
                            <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition flex items-center justify-center text-white text-xs font-semibold">
                              <span>Enlarge View</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-[#991B1B] italic p-3 bg-[#FEE2E2] rounded">
                        No photos attached to this claim.
                      </p>
                    )}
                  </div>

                  {/* CUSTOMER NOTES & ISSUE DETAILS */}
                  <div className="p-4 bg-[#FAF8F5] border border-[#ECE6DE] rounded-lg space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-[#210D15] uppercase tracking-wider">
                        Customer Damage Statement
                      </span>
                      {(() => {
                        const r = getReasonLabel(inspectData.claim.items?.[0]?.reason || 'damaged_in_transit');
                        return (
                          <span className={`px-2 py-0.5 rounded text-[10px] font-semibold border ${r.color}`}>
                            {r.label}
                          </span>
                        );
                      })()}
                    </div>
                    <p className="text-xs text-[#2D2A26] bg-[#FFFFFF] p-3 rounded border border-[#ECE6DE] leading-relaxed">
                      "{inspectData.claim.customerNotes || 'No notes provided by customer.'}"
                    </p>
                    <div className="grid grid-cols-2 gap-2 text-[11px] text-[#70675E] pt-1">
                      <div>Customer: <strong className="text-[#210D15]">{inspectData.claim.customerName}</strong></div>
                      <div>Contact: <strong className="text-[#210D15]">{inspectData.claim.customerPhone}</strong></div>
                    </div>
                  </div>

                  {/* CLAIMED ITEMS */}
                  <div className="space-y-2">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-[#210D15] flex items-center gap-1.5">
                      <Package className="w-4 h-4 text-[#70675E]" />
                      <span>Affected Product Items</span>
                    </h3>
                    <div className="space-y-2">
                      {inspectData.claim.items?.map((item, idx) => (
                        <div
                          key={idx}
                          className="flex items-center justify-between p-3 bg-[#FFFFFF] border border-[#ECE6DE] rounded-lg text-xs"
                        >
                          <div>
                            <p className="font-bold text-[#210D15]">{item.packName || 'Standard Pack'}</p>
                            <p className="text-[11px] text-[#70675E] font-mono">SKU: {item.baseSku}</p>
                          </div>
                          <div className="text-right">
                            <span className="px-2 py-0.5 bg-[#FAF8F5] border border-[#D5CCC1] rounded font-semibold text-[#210D15]">
                              Qty: {item.physicalUnitsCount || 1}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* REPLACEMENT ORDER LINK (IF ALREADY APPROVED) */}
                  {inspectData.replacementOrder && (
                    <div className="p-4 bg-[#DCFCE7] border border-[#86EFAC] rounded-lg space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-[#166534] flex items-center gap-1.5">
                          <CheckCircle2 className="w-4 h-4" />
                          <span>Replacement Dispatched</span>
                        </span>
                        <Link
                          href={`/admin/orders/${inspectData.replacementOrder.id}`}
                          className="text-xs font-bold text-[#166534] underline flex items-center gap-1 hover:text-[#14532D]"
                        >
                          <span>View Order {inspectData.replacementOrder.id}</span>
                          <ExternalLink className="w-3.5 h-3.5" />
                        </Link>
                      </div>
                      <p className="text-[11px] text-[#166534] leading-relaxed">
                        100% Free Replacement Order created on {new Date((inspectData.replacementOrder.createdAt as any)?.seconds * 1000 || Date.now()).toLocaleDateString('en-IN')}. Stock allocated and ready for dispatch.
                      </p>
                    </div>
                  )}

                  {/* REJECTION DETAILS (IF REJECTED) */}
                  {inspectData.claim.status === 'rejected' && (
                    <div className="p-4 bg-[#FEE2E2] border border-[#FCA5A5] rounded-lg space-y-1">
                      <span className="text-xs font-bold text-[#991B1B] flex items-center gap-1.5">
                        <XCircle className="w-4 h-4" />
                        <span>Claim Rejected</span>
                      </span>
                      <p className="text-xs text-[#991B1B]">
                        Reason: {inspectData.claim.rejectionReason || 'Criteria not met.'}
                      </p>
                    </div>
                  )}

                  {/* ADMIN REVIEW CONTROLS (IF PENDING) */}
                  {(inspectData.claim.status === 'requested' || inspectData.claim.status === 'inspection_pending') && (
                    <div className="p-4 bg-[#FFFFFF] border-2 border-[#210D15] rounded-lg space-y-4 shadow-sm">
                      <h3 className="text-xs font-bold uppercase tracking-wider text-[#210D15]">
                        Admin Decision Console
                      </h3>

                      <div>
                        <label className="block text-[11px] font-semibold text-[#554E46] mb-1">
                          Internal Inspection Notes (Optional)
                        </label>
                        <textarea
                          rows={2}
                          value={adminNotes}
                          onChange={(e) => setAdminNotes(e.target.value)}
                          placeholder="e.g. Verified outer box crushing and intact tamper tape. Approving replacement unit."
                          className="w-full px-3 py-2 text-xs border border-[#D5CCC1] rounded bg-[#FAF8F5] focus:bg-[#FFFFFF] focus:outline-none focus:ring-1 focus:ring-[#210D15]"
                        />
                      </div>

                      {showRejectBox && (
                        <div className="p-3 bg-[#FEE2E2] border border-[#FECACA] rounded space-y-2 animate-in fade-in duration-150">
                          <label className="block text-[11px] font-bold text-[#991B1B]">
                            Rejection Reason (Will be communicated to customer) *
                          </label>
                          <textarea
                            rows={2}
                            value={rejectionReason}
                            onChange={(e) => setRejectionReason(e.target.value)}
                            placeholder="e.g. Photo proof shows unbroken factory seal; no damage visible on packaging."
                            className="w-full px-3 py-2 text-xs border border-[#FCA5A5] rounded bg-[#FFFFFF] text-[#991B1B] focus:outline-none"
                          />
                          <div className="flex justify-end gap-2">
                            <button
                              type="button"
                              onClick={() => setShowRejectBox(false)}
                              className="px-3 py-1 text-xs text-[#70675E] hover:underline"
                            >
                              Cancel
                            </button>
                            <button
                              type="button"
                              onClick={handleRejectClaim}
                              disabled={actionInProgress}
                              className="px-3 py-1 bg-[#991B1B] text-white text-xs font-semibold rounded hover:bg-[#7F1D1D] transition"
                            >
                              {actionInProgress ? 'Rejecting...' : 'Confirm Rejection'}
                            </button>
                          </div>
                        </div>
                      )}

                      {!showRejectBox && (
                        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
                          <button
                            type="button"
                            onClick={() => setShowRejectBox(true)}
                            disabled={actionInProgress}
                            className="w-full sm:w-auto px-4 py-2 border border-[#DC2626] text-[#DC2626] text-xs font-semibold rounded hover:bg-[#FEE2E2] transition"
                          >
                            Reject Claim
                          </button>

                          <button
                            type="button"
                            onClick={handleApproveReplacement}
                            disabled={actionInProgress}
                            className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-5 py-2.5 bg-[#15803D] text-[#FAF8F5] text-xs font-bold rounded shadow hover:bg-[#166534] transition disabled:opacity-50"
                          >
                            <CheckCircle2 className="w-4 h-4" />
                            <span>
                              {actionInProgress
                                ? 'Generating Order...'
                                : 'Approve & Dispatch Free Replacement'}
                            </span>
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </>
              ) : null}
            </div>

            {/* MODAL FOOTER */}
            <div className="p-4 border-t border-[#ECE6DE] bg-[#FAF8F5] flex justify-end">
              <button
                type="button"
                onClick={closeInspection}
                className="px-4 py-2 border border-[#D5CCC1] text-xs font-medium rounded hover:bg-[#FFFFFF] text-[#210D15] transition"
              >
                Close Inspector
              </button>
            </div>
          </div>
        </div>
      )}

      {/* FULL PHOTO LIGHTBOX MODAL */}
      {activePhotoModal && (
        <div
          onClick={() => setActivePhotoModal(null)}
          className="fixed inset-0 z-60 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-150 cursor-pointer"
        >
          <div className="max-w-3xl max-h-[90vh] bg-transparent relative" onClick={(e) => e.stopPropagation()}>
            <img
              src={activePhotoModal}
              alt="Enlarged evidence"
              className="max-h-[85vh] max-w-full rounded-lg shadow-2xl object-contain mx-auto"
            />
            <button
              type="button"
              onClick={() => setActivePhotoModal(null)}
              className="absolute -top-3 -right-3 w-8 h-8 rounded-full bg-[#FFFFFF] text-[#210D15] font-bold shadow flex items-center justify-center hover:bg-[#FAF8F5]"
            >
              ✕
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
