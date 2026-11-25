'use client';

import React, { useState, useEffect } from 'react';
import {
  MessageSquare,
  Search,
  RefreshCw,
  AlertCircle,
  CheckCircle2,
  Clock,
  Phone,
  Mail,
  ExternalLink,
  X,
  Send,
  User,
  Calendar,
  Save,
  Loader2,
  FileText,
  MessageCircle,
} from 'lucide-react';
import type { FirestoreSupportQuery, SupportQueryStatus } from '@/types/firestore';

export default function AdminSupportQueriesPage() {
  const [queries, setQueries] = useState<FirestoreSupportQuery[]>([]);
  const [counts, setCounts] = useState({
    all: 0,
    new: 0,
    in_progress: 0,
    resolved: 0,
  });
  const [activeTab, setActiveTab] = useState<'all' | 'new' | 'in_progress' | 'resolved'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Inspection Drawer State
  const [selectedQuery, setSelectedQuery] = useState<FirestoreSupportQuery | null>(null);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [adminNotes, setAdminNotes] = useState('');
  const [savingNotes, setSavingNotes] = useState(false);
  const [actionMessage, setActionMessage] = useState<string | null>(null);

  const fetchQueries = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (activeTab !== 'all') params.append('status', activeTab);
      if (searchQuery.trim()) params.append('search', searchQuery.trim());

      const res = await fetch(`/api/v1/admin/queries?${params.toString()}`);
      const json = await res.json();

      if (!res.ok || !json.success) {
        throw new Error(json.error || 'Failed to fetch customer queries');
      }

      setQueries(json.data || []);
      if (json.counts) {
        setCounts(json.counts);
      }
    } catch (err: any) {
      console.error('[Admin Queries] Fetch error:', err);
      setError(err.message || 'Error loading inquiries');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQueries();
  }, [activeTab]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchQueries();
  };

  const openQueryDetails = (query: FirestoreSupportQuery) => {
    setSelectedQuery(query);
    setAdminNotes(query.adminNotes || '');
    setActionMessage(null);
  };

  const handleUpdateStatus = async (newStatus: SupportQueryStatus) => {
    if (!selectedQuery) return;
    setUpdatingStatus(true);
    setActionMessage(null);

    try {
      const res = await fetch('/api/v1/admin/queries', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: selectedQuery.id,
          status: newStatus,
        }),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || 'Failed to update query status');
      }

      // Update local state
      const updated = { ...selectedQuery, status: newStatus };
      setSelectedQuery(updated);
      setQueries((prev) => prev.map((q) => (q.id === updated.id ? updated : q)));
      setActionMessage(`Status updated to "${newStatus.replace('_', ' ').toUpperCase()}"`);

      // Refresh counts in background
      fetchQueries();
    } catch (err: any) {
      console.error('[Admin Queries] Status update error:', err);
      setActionMessage(`Error: ${err.message}`);
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handleSaveNotes = async () => {
    if (!selectedQuery) return;
    setSavingNotes(true);
    setActionMessage(null);

    try {
      const res = await fetch('/api/v1/admin/queries', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: selectedQuery.id,
          adminNotes,
        }),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || 'Failed to save notes');
      }

      const updated = { ...selectedQuery, adminNotes };
      setSelectedQuery(updated);
      setQueries((prev) => prev.map((q) => (q.id === updated.id ? updated : q)));
      setActionMessage('Internal resolution notes saved successfully.');
    } catch (err: any) {
      console.error('[Admin Queries] Save notes error:', err);
      setActionMessage(`Error: ${err.message}`);
    } finally {
      setSavingNotes(false);
    }
  };

  const formatDate = (timestamp: any) => {
    if (!timestamp) return 'Just now';
    try {
      const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
      return new Intl.DateTimeFormat('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }).format(date);
    } catch {
      return 'Recent';
    }
  };

  const getStatusBadge = (status: SupportQueryStatus) => {
    switch (status) {
      case 'new':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-[#FEF3C7] text-[#92400E] border border-[#FDE68A]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#D97706] animate-pulse" />
            New Inquiry
          </span>
        );
      case 'in_progress':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-[#EFF6FF] text-[#1E40AF] border border-[#BFDBFE]">
            <Clock className="w-3 h-3 text-[#2563EB]" />
            In Progress
          </span>
        );
      case 'resolved':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-[#ECFDF5] text-[#065F46] border border-[#A7F3D0]">
            <CheckCircle2 className="w-3 h-3 text-[#059669]" />
            Resolved
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[#210D15]">
            Customer Support Queries & Leads
          </h1>
          <p className="text-xs text-[#70675E] mt-1">
            Incoming inquiries from storefront contact form, phone callbacks, and product formulation questions.
          </p>
        </div>

        <button
          onClick={fetchQueries}
          disabled={loading}
          className="inline-flex items-center gap-2 px-3 py-2 text-xs font-medium rounded-lg bg-[#FAF8F5] border border-[#D5CCC1] text-[#210D15] hover:bg-[#F3EFEA] transition disabled:opacity-50 self-start sm:self-auto cursor-pointer"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-[#FFFFFF] border border-[#E5E0D8] shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-medium text-[#70675E] uppercase tracking-wider">
              Total Queries
            </span>
            <MessageSquare className="w-4 h-4 text-[#8C827A]" />
          </div>
          <p className="text-2xl font-bold text-[#210D15] mt-2 font-mono">{counts.all}</p>
          <span className="text-[10px] text-[#8C827A] mt-0.5 block">Storefront customer contacts</span>
        </div>

        <div className="p-4 rounded-xl bg-[#FFFBEB] border border-[#FDE68A] shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-[#92400E] uppercase tracking-wider flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#D97706] animate-pulse" />
              New / Action
            </span>
            <AlertCircle className="w-4 h-4 text-[#D97706]" />
          </div>
          <p className="text-2xl font-bold text-[#92400E] mt-2 font-mono">{counts.new}</p>
          <span className="text-[10px] text-[#B45309] mt-0.5 block">Awaiting initial reply</span>
        </div>

        <div className="p-4 rounded-xl bg-[#EFF6FF] border border-[#BFDBFE] shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-[#1E40AF] uppercase tracking-wider">
              In Progress
            </span>
            <Clock className="w-4 h-4 text-[#2563EB]" />
          </div>
          <p className="text-2xl font-bold text-[#1E40AF] mt-2 font-mono">{counts.in_progress}</p>
          <span className="text-[10px] text-[#3B82F6] mt-0.5 block">Being handled by support</span>
        </div>

        <div className="p-4 rounded-xl bg-[#ECFDF5] border border-[#A7F3D0] shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-[#065F46] uppercase tracking-wider">
              Resolved
            </span>
            <CheckCircle2 className="w-4 h-4 text-[#059669]" />
          </div>
          <p className="text-2xl font-bold text-[#065F46] mt-2 font-mono">{counts.resolved}</p>
          <span className="text-[10px] text-[#047857] mt-0.5 block">Closed & answered</span>
        </div>
      </div>

      {/* Filter Tabs & Search Bar */}
      <div className="p-4 rounded-xl bg-[#FFFFFF] border border-[#E5E0D8] space-y-4 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          {/* Status Tabs */}
          <div className="flex items-center gap-1.5 p-1 bg-[#FAF8F5] border border-[#E5E0D8] rounded-lg overflow-x-auto text-xs">
            <button
              onClick={() => setActiveTab('all')}
              className={`px-3 py-1.5 rounded-md font-medium transition cursor-pointer whitespace-nowrap ${
                activeTab === 'all'
                  ? 'bg-[#210D15] text-[#FAF8F5] shadow-xs'
                  : 'text-[#70675E] hover:text-[#210D15]'
              }`}
            >
              All Queries ({counts.all})
            </button>
            <button
              onClick={() => setActiveTab('new')}
              className={`px-3 py-1.5 rounded-md font-medium transition cursor-pointer whitespace-nowrap ${
                activeTab === 'new'
                  ? 'bg-[#210D15] text-[#FAF8F5] shadow-xs'
                  : 'text-[#70675E] hover:text-[#210D15]'
              }`}
            >
              New ({counts.new})
            </button>
            <button
              onClick={() => setActiveTab('in_progress')}
              className={`px-3 py-1.5 rounded-md font-medium transition cursor-pointer whitespace-nowrap ${
                activeTab === 'in_progress'
                  ? 'bg-[#210D15] text-[#FAF8F5] shadow-xs'
                  : 'text-[#70675E] hover:text-[#210D15]'
              }`}
            >
              In Progress ({counts.in_progress})
            </button>
            <button
              onClick={() => setActiveTab('resolved')}
              className={`px-3 py-1.5 rounded-md font-medium transition cursor-pointer whitespace-nowrap ${
                activeTab === 'resolved'
                  ? 'bg-[#210D15] text-[#FAF8F5] shadow-xs'
                  : 'text-[#70675E] hover:text-[#210D15]'
              }`}
            >
              Resolved ({counts.resolved})
            </button>
          </div>

          {/* Search Form */}
          <form onSubmit={handleSearchSubmit} className="relative sm:w-80">
            <Search className="w-3.5 h-3.5 text-[#8C827A] absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by name, email, phone, or subject..."
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-[#FAF8F5] border border-[#D5CCC1] rounded-lg focus:outline-none focus:border-[#210D15] focus:bg-[#FFFFFF] transition"
            />
          </form>
        </div>

        {/* Query List */}
        {error && (
          <div className="p-3 bg-[#FEF2F2] border border-[#FCA5A5] rounded-lg text-xs text-[#B91C1C] flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {loading ? (
          <div className="py-16 text-center text-xs text-[#70675E] flex items-center justify-center gap-2">
            <Loader2 className="w-4 h-4 animate-spin text-[#210D15]" />
            <span>Loading customer inquiries...</span>
          </div>
        ) : queries.length === 0 ? (
          <div className="py-16 text-center space-y-2">
            <MessageSquare className="w-8 h-8 text-[#D5CCC1] mx-auto" />
            <p className="text-sm font-semibold text-[#210D15]">No Support Queries Found</p>
            <p className="text-xs text-[#70675E] max-w-sm mx-auto">
              {searchQuery
                ? `No inquiries match "${searchQuery}". Try clearing search.`
                : 'Customer inquiries submitted via the Contact Us storefront form will appear here.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-[#E5E0D8] text-[#8C827A] uppercase tracking-wider font-semibold text-[10px]">
                  <th className="py-2.5 px-3">Customer</th>
                  <th className="py-2.5 px-3">Contact Channels</th>
                  <th className="py-2.5 px-3">Subject & Query Preview</th>
                  <th className="py-2.5 px-3">Date</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F0EBE1]">
                {queries.map((q) => {
                  const cleanPhone = q.phone?.replace(/[^0-9]/g, '');
                  return (
                    <tr
                      key={q.id}
                      onClick={() => openQueryDetails(q)}
                      className="hover:bg-[#FAF8F5] transition cursor-pointer group"
                    >
                      <td className="py-3 px-3">
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-full bg-[#210D15] text-[#FAF8F5] flex items-center justify-center font-bold text-[11px] shrink-0">
                            {q.name.slice(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-semibold text-[#210D15] group-hover:text-[#B85D19] transition">
                              {q.name}
                            </p>
                            <span className="text-[10px] font-mono text-[#8C827A]">{q.id}</span>
                          </div>
                        </div>
                      </td>

                      <td className="py-3 px-3">
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-1.5 text-[#524B43]">
                            <Mail className="w-3 h-3 text-[#8C827A]" />
                            <span className="truncate max-w-[160px]">{q.email}</span>
                          </div>
                          {q.phone ? (
                            <div className="flex items-center gap-1.5 text-[#524B43] font-mono text-[11px]">
                              <Phone className="w-3 h-3 text-[#8C827A]" />
                              <span>{q.phone}</span>
                            </div>
                          ) : (
                            <span className="text-[10px] text-[#A89F95] italic">No phone</span>
                          )}
                        </div>
                      </td>

                      <td className="py-3 px-3 max-w-xs">
                        <p className="font-medium text-[#210D15] truncate">{q.subject}</p>
                        <p className="text-[11px] text-[#70675E] truncate mt-0.5">{q.message}</p>
                      </td>

                      <td className="py-3 px-3 text-[#70675E] whitespace-nowrap text-[11px]">
                        {formatDate(q.createdAt)}
                      </td>

                      <td className="py-3 px-3 whitespace-nowrap">{getStatusBadge(q.status)}</td>

                      <td className="py-3 px-3 text-right">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            openQueryDetails(q);
                          }}
                          className="px-2.5 py-1 text-[11px] font-medium rounded-md bg-[#FAF8F5] border border-[#D5CCC1] text-[#210D15] hover:bg-[#210D15] hover:text-[#FAF8F5] transition cursor-pointer"
                        >
                          View Query
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

      {/* Slide-over Inspection Modal / Drawer */}
      {selectedQuery && (
        <div className="fixed inset-0 z-50 bg-[#210D15]/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#FFFFFF] rounded-2xl border border-[#D5CCC1] shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto flex flex-col animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="p-5 border-b border-[#E5E0D8] flex items-center justify-between sticky top-0 bg-[#FFFFFF] z-10">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-[#210D15] text-[#FAF8F5] flex items-center justify-center font-bold text-xs">
                  {selectedQuery.name.slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-base font-bold text-[#210D15]">{selectedQuery.name}</h2>
                    {getStatusBadge(selectedQuery.status)}
                  </div>
                  <p className="text-[11px] font-mono text-[#8C827A]">{selectedQuery.id}</p>
                </div>
              </div>

              <button
                onClick={() => setSelectedQuery(null)}
                className="p-1.5 rounded-lg text-[#8C827A] hover:bg-[#FAF8F5] hover:text-[#210D15] transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-6">
              {actionMessage && (
                <div className="p-3 bg-[#F0FDF4] border border-[#BBF7D0] rounded-lg text-xs text-[#15803D] flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>{actionMessage}</span>
                </div>
              )}

              {/* Contact Channels & Direct Reach Action */}
              <div className="p-4 rounded-xl bg-[#FAF8F5] border border-[#E5E0D8] space-y-3">
                <span className="text-[10px] font-bold text-[#8C827A] uppercase tracking-wider block">
                  Customer Direct Contact Information
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="flex items-center justify-between p-2.5 rounded-lg bg-[#FFFFFF] border border-[#E5E0D8]">
                    <div className="min-w-0 pr-2">
                      <span className="text-[10px] text-[#8C827A] block">Email Address</span>
                      <p className="font-semibold text-[#210D15] truncate">{selectedQuery.email}</p>
                    </div>
                    <a
                      href={`mailto:${selectedQuery.email}?subject=Regarding your inquiry: ${selectedQuery.subject}`}
                      className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-medium rounded bg-[#210D15] text-[#FAF8F5] hover:bg-[#321721] transition shrink-0"
                    >
                      <Mail className="w-3 h-3 text-[#E8C5A5]" />
                      Reply
                    </a>
                  </div>

                  <div className="flex items-center justify-between p-2.5 rounded-lg bg-[#FFFFFF] border border-[#E5E0D8]">
                    <div className="min-w-0 pr-2">
                      <span className="text-[10px] text-[#8C827A] block">Phone / WhatsApp</span>
                      <p className="font-semibold text-[#210D15] font-mono">
                        {selectedQuery.phone || 'Not Provided'}
                      </p>
                    </div>
                    {selectedQuery.phone && (
                      <div className="flex items-center gap-1.5 shrink-0">
                        <a
                          href={`https://wa.me/${selectedQuery.phone.replace(/[^0-9]/g, '')}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 px-2 py-1 text-[11px] font-medium rounded bg-[#15803D] text-[#FFFFFF] hover:bg-[#166534] transition"
                        >
                          <MessageCircle className="w-3 h-3" />
                          Chat
                        </a>
                        <a
                          href={`tel:${selectedQuery.phone}`}
                          className="p-1 rounded bg-[#F0EBE1] text-[#210D15] hover:bg-[#D5CCC1] transition"
                        >
                          <Phone className="w-3.5 h-3.5" />
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Inquiry Subject & Message */}
              <div className="space-y-2">
                <span className="text-[10px] font-bold text-[#8C827A] uppercase tracking-wider block">
                  Inquiry Subject & Full Message
                </span>
                <div className="p-4 rounded-xl bg-[#FFFFFF] border border-[#E5E0D8] space-y-3">
                  <h3 className="text-sm font-bold text-[#210D15] border-b border-[#F0EBE1] pb-2">
                    {selectedQuery.subject}
                  </h3>
                  <p className="text-xs text-[#524B43] leading-relaxed whitespace-pre-wrap">
                    {selectedQuery.message}
                  </p>
                  <div className="pt-2 border-t border-[#F0EBE1] flex items-center justify-between text-[11px] text-[#8C827A]">
                    <span>Submitted on: {formatDate(selectedQuery.createdAt)}</span>
                    {selectedQuery.resolvedBy && (
                      <span className="text-[#15803D]">
                        Resolved by: {selectedQuery.resolvedBy}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Quick Status Management */}
              <div className="space-y-2">
                <span className="text-[10px] font-bold text-[#8C827A] uppercase tracking-wider block">
                  Update Resolution Status
                </span>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => handleUpdateStatus('new')}
                    disabled={updatingStatus || selectedQuery.status === 'new'}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition cursor-pointer disabled:opacity-50 ${
                      selectedQuery.status === 'new'
                        ? 'bg-[#FEF3C7] text-[#92400E] border border-[#FDE68A]'
                        : 'bg-[#FAF8F5] border border-[#D5CCC1] text-[#524B43] hover:bg-[#F3EFEA]'
                    }`}
                  >
                    Mark as New
                  </button>
                  <button
                    onClick={() => handleUpdateStatus('in_progress')}
                    disabled={updatingStatus || selectedQuery.status === 'in_progress'}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition cursor-pointer disabled:opacity-50 ${
                      selectedQuery.status === 'in_progress'
                        ? 'bg-[#EFF6FF] text-[#1E40AF] border border-[#BFDBFE]'
                        : 'bg-[#FAF8F5] border border-[#D5CCC1] text-[#524B43] hover:bg-[#F3EFEA]'
                    }`}
                  >
                    Mark as In Progress
                  </button>
                  <button
                    onClick={() => handleUpdateStatus('resolved')}
                    disabled={updatingStatus || selectedQuery.status === 'resolved'}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition cursor-pointer disabled:opacity-50 ${
                      selectedQuery.status === 'resolved'
                        ? 'bg-[#ECFDF5] text-[#065F46] border border-[#A7F3D0]'
                        : 'bg-[#FAF8F5] border border-[#D5CCC1] text-[#065F46] hover:bg-[#ECFDF5]'
                    }`}
                  >
                    ✓ Mark as Resolved
                  </button>
                </div>
              </div>

              {/* Internal Admin Notes */}
              <div className="space-y-2">
                <span className="text-[10px] font-bold text-[#8C827A] uppercase tracking-wider block">
                  Internal Resolution Notes & Call Log
                </span>
                <textarea
                  rows={3}
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  placeholder="e.g. Called customer at 2:30 PM. Clarified formulation ingredients and delivery timeline..."
                  className="w-full px-3 py-2 text-xs bg-[#FAF8F5] border border-[#D5CCC1] rounded-lg focus:outline-none focus:border-[#210D15] focus:bg-[#FFFFFF] transition"
                />
                <button
                  onClick={handleSaveNotes}
                  disabled={savingNotes}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-[#210D15] text-[#FAF8F5] hover:bg-[#321721] transition cursor-pointer disabled:opacity-50"
                >
                  {savingNotes ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Save className="w-3.5 h-3.5 text-[#E8C5A5]" />
                  )}
                  <span>Save Internal Notes</span>
                </button>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-[#E5E0D8] bg-[#FAF8F5] flex justify-end">
              <button
                onClick={() => setSelectedQuery(null)}
                className="px-4 py-2 text-xs font-medium rounded-lg bg-[#FFFFFF] border border-[#D5CCC1] text-[#210D15] hover:bg-[#F0EBE1] transition cursor-pointer"
              >
                Close Details
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
