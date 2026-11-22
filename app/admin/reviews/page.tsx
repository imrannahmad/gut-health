'use client';

import React, { useEffect, useState } from 'react';
import {
  Star,
  CheckCircle2,
  XCircle,
  AlertCircle,
  RefreshCw,
  Trash2,
  ShoppingBag,
  User,
  Clock,
  Filter,
} from 'lucide-react';

interface Review {
  id: string;
  productId: string;
  customerName: string;
  customerEmail?: string;
  orderId: string;
  rating: number;
  title: string;
  comment: string;
  isVerifiedBuyer: boolean;
  status: 'pending' | 'approved' | 'rejected';
  moderatedBy?: string;
  moderatedAt?: any;
  createdAt?: any;
}

export default function AdminReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusTab, setStatusTab] = useState<'pending' | 'approved' | 'rejected' | 'all'>('pending');
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const fetchReviews = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({ limit: '50' });
      if (statusTab !== 'all') params.append('status', statusTab);

      const res = await fetch(`/api/v1/admin/reviews?${params.toString()}`);
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || 'Failed to load reviews');
      }
      setReviews(json.data || []);
    } catch (err: any) {
      setError(err.message || 'Error fetching reviews');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, [statusTab]);

  const handleModerate = async (reviewId: string, action: 'approve' | 'reject') => {
    setUpdatingId(reviewId);
    try {
      const res = await fetch(`/api/v1/admin/reviews/${reviewId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || `Failed to ${action} review`);
      }
      const updatedStatus = action === 'approve' ? 'approved' : 'rejected';
      setReviews((prev) =>
        prev.map((r) => (r.id === reviewId ? { ...r, status: updatedStatus } : r))
      );
    } catch (err: any) {
      alert(`Moderation failed: ${err.message}`);
    } finally {
      setUpdatingId(null);
    }
  };

  const handleDelete = async (reviewId: string) => {
    if (!confirm('Are you sure you want to permanently delete this review?')) return;

    try {
      const res = await fetch(`/api/v1/admin/reviews/${reviewId}`, {
        method: 'DELETE',
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || 'Failed to delete review');
      }
      setReviews((prev) => prev.filter((r) => r.id !== reviewId));
    } catch (err: any) {
      alert(`Delete failed: ${err.message}`);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-[#ECE6DE]">
        <div>
          <h1 className="text-2xl lg:text-3xl font-serif text-[#210D15] font-semibold tracking-tight">
            Customer Reviews Moderation
          </h1>
          <p className="text-xs text-[#70675E] mt-1">
            Review verified buyer testimonials, approve editorial feedback, and auto-aggregate star ratings.
          </p>
        </div>

        <button
          onClick={fetchReviews}
          disabled={loading}
          className="p-2 border border-[#D5CCC1] rounded-md text-[#554E46] hover:bg-[#FFFFFF] transition self-start sm:self-auto"
          title="Refresh Reviews"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 bg-[#EBE4DC] p-1 rounded-md text-xs w-fit max-w-full overflow-x-auto no-scrollbar">
        {(['pending', 'approved', 'rejected', 'all'] as const).map((t) => (
          <button
            key={t}
            onClick={() => setStatusTab(t)}
            className={`px-3 py-1.5 rounded capitalize font-medium transition whitespace-nowrap ${
              statusTab === t
                ? 'bg-[#FFFFFF] text-[#210D15] shadow-xs'
                : 'text-[#696159] hover:text-[#210D15]'
            }`}
          >
            {t} {t === 'pending' && reviews.filter(r => r.status === 'pending').length > 0 && `(${reviews.filter(r => r.status === 'pending').length})`}
          </button>
        ))}
      </div>

      {/* Error state */}
      {error && (
        <div className="p-4 bg-[#FEE2E2] border border-[#FCA5A5] text-[#991B1B] rounded-md text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Reviews List */}
      <div className="space-y-4">
        {loading ? (
          <div className="py-16 text-center text-xs text-[#70675E] bg-[#FFFFFF] border border-[#E8E2D9] rounded-lg">
            <RefreshCw className="w-5 h-5 animate-spin mx-auto text-[#210D15] mb-2" />
            <p>Loading customer reviews...</p>
          </div>
        ) : reviews.length === 0 ? (
          <div className="py-16 text-center text-xs text-[#70675E] bg-[#FFFFFF] border border-[#E8E2D9] rounded-lg space-y-2">
            <Star className="w-8 h-8 mx-auto text-[#C5BDB5]" />
            <p className="font-medium text-[#210D15]">No {statusTab !== 'all' ? statusTab : ''} reviews found</p>
            <p className="text-[11px] text-[#8C827A]">Customer submissions will appear here for editorial moderation.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {reviews.map((r) => {
              const dateStr = r.createdAt?.toDate
                ? r.createdAt.toDate().toLocaleDateString('en-IN', {
                    day: '2-digit',
                    month: 'short',
                    year: 'numeric',
                  })
                : 'Recent';

              return (
                <div
                  key={r.id}
                  className="bg-[#FFFFFF] border border-[#E8E2D9] rounded-lg p-5 shadow-xs space-y-3 flex flex-col justify-between"
                >
                  <div className="space-y-2">
                    {/* Top Row: Stars, Product & Status */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1 text-[#D97706]">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <span key={i} className={i < r.rating ? 'text-[#D97706]' : 'text-[#E5E7EB]'}>
                            ★
                          </span>
                        ))}
                        <span className="text-xs font-bold ml-1 text-[#210D15]">{r.rating}.0</span>
                      </div>

                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium capitalize ${
                          r.status === 'approved'
                            ? 'bg-[#DCFCE7] text-[#166534]'
                            : r.status === 'rejected'
                            ? 'bg-[#FEE2E2] text-[#991B1B]'
                            : 'bg-[#FEF3C7] text-[#92400E]'
                        }`}
                      >
                        {r.status}
                      </span>
                    </div>

                    {/* Title & Comment */}
                    <h3 className="font-serif font-bold text-sm text-[#210D15] leading-tight">
                      "{r.title}"
                    </h3>
                    <p className="text-xs text-[#554E46] leading-relaxed">
                      {r.comment}
                    </p>
                  </div>

                  {/* Bottom: Customer & Action Buttons */}
                  <div className="pt-3 border-t border-[#ECE6DE] space-y-3">
                    <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] text-[#70675E]">
                      <div className="flex items-center gap-1.5">
                        <span className="font-semibold text-[#210D15]">{r.customerName}</span>
                        {r.isVerifiedBuyer && (
                          <span className="inline-flex items-center gap-0.5 text-[9px] font-medium text-[#166534] bg-[#DCFCE7] px-1.5 py-0.5 rounded">
                            <CheckCircle2 className="w-2.5 h-2.5" />
                            Verified Buyer
                          </span>
                        )}
                      </div>

                      <span className="font-mono text-[10px] bg-[#FAF8F5] px-1.5 py-0.5 rounded border border-[#ECE6DE]">
                        Order: {r.orderId}
                      </span>
                    </div>

                    {/* Moderation Action Buttons */}
                    <div className="flex items-center justify-between pt-1">
                      <span className="text-[10px] text-[#8C827A] flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {dateStr}
                      </span>

                      <div className="flex items-center gap-2">
                        {r.status !== 'approved' && (
                          <button
                            onClick={() => handleModerate(r.id, 'approve')}
                            disabled={updatingId === r.id}
                            className="inline-flex items-center gap-1 px-3 py-1 bg-[#166534] text-[#FFFFFF] rounded text-xs font-medium hover:bg-[#15803D] transition disabled:opacity-50"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Approve</span>
                          </button>
                        )}

                        {r.status !== 'rejected' && (
                          <button
                            onClick={() => handleModerate(r.id, 'reject')}
                            disabled={updatingId === r.id}
                            className="inline-flex items-center gap-1 px-3 py-1 bg-[#991B1B] text-[#FFFFFF] rounded text-xs font-medium hover:bg-[#B91C1C] transition disabled:opacity-50"
                          >
                            <XCircle className="w-3.5 h-3.5" />
                            <span>Reject</span>
                          </button>
                        )}

                        <button
                          onClick={() => handleDelete(r.id)}
                          className="p-1 border border-[#D5CCC1] rounded text-[#8C827A] hover:text-[#991B1B] hover:bg-[#FEE2E2] transition"
                          title="Delete review permanently"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
