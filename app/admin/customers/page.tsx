'use client';

import React, { useEffect, useState } from 'react';
import {
  Users,
  Search,
  RefreshCw,
  AlertCircle,
  FileText,
  ShoppingBag,
  IndianRupee,
  MapPin,
  Clock,
  X,
  Plus,
} from 'lucide-react';

interface CustomerItem {
  uid: string;
  email: string;
  phoneNumber?: string;
  displayName?: string;
  totalOrders: number;
  totalSpendInPaise: number;
  lastOrderDate?: any;
  createdAt?: any;
  addressCount?: number;
}

interface SupportNote {
  id: string;
  note: string;
  authorEmail: string;
  createdAt: any;
}

export default function AdminCustomersPage() {
  const [customers, setCustomers] = useState<CustomerItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');

  // Selected Customer for Notes Modal
  const [selectedCustomer, setSelectedCustomer] = useState<CustomerItem | null>(null);
  const [notes, setNotes] = useState<SupportNote[]>([]);
  const [loadingNotes, setLoadingNotes] = useState(false);
  const [newNote, setNewNote] = useState('');
  const [submittingNote, setSubmittingNote] = useState(false);

  const fetchCustomers = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({ limit: '50' });
      if (search.trim()) params.append('q', search.trim());

      const res = await fetch(`/api/v1/admin/customers?${params.toString()}`);
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || 'Failed to load customers');
      }
      setCustomers(json.data || []);
    } catch (err: any) {
      setError(err.message || 'Error fetching customers');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchCustomers();
  };

  const handleOpenNotes = async (customer: CustomerItem) => {
    setSelectedCustomer(customer);
    setLoadingNotes(true);
    try {
      const res = await fetch(`/api/v1/admin/customers/${customer.uid}`);
      const json = await res.json();
      if (res.ok && json.success) {
        setNotes(json.data?.supportNotes || []);
      }
    } catch (err) {
      console.error('Error fetching support notes:', err);
    } finally {
      setLoadingNotes(false);
    }
  };

  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCustomer || !newNote.trim()) return;

    setSubmittingNote(true);
    try {
      const res = await fetch(`/api/v1/admin/customers/${selectedCustomer.uid}/notes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ note: newNote.trim() }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || 'Failed to add note');
      }
      setNotes((prev) => [json.data, ...prev]);
      setNewNote('');
    } catch (err: any) {
      alert(`Could not add note: ${err.message}`);
    } finally {
      setSubmittingNote(false);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-[#ECE6DE]">
        <div>
          <h1 className="text-2xl lg:text-3xl font-serif text-[#210D15] font-semibold tracking-tight">
            Customer Directory & CRM
          </h1>
          <p className="text-xs text-[#70675E] mt-1">
            Browse registered customer accounts, lifetime purchase values, and internal support history.
          </p>
        </div>

        <button
          onClick={fetchCustomers}
          disabled={loading}
          className="p-2 border border-[#D5CCC1] rounded-md text-[#554E46] hover:bg-[#FFFFFF] transition self-start sm:self-auto"
          title="Refresh Customers"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Search Bar */}
      <form onSubmit={handleSearchSubmit} className="relative max-w-md">
        <Search className="w-4 h-4 text-[#8C827A] absolute left-3 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name, email, or mobile..."
          className="w-full pl-9 pr-20 py-2 bg-[#FFFFFF] border border-[#D5CCC1] rounded-md text-xs text-[#2D2A26] placeholder-[#8C827A] focus:outline-none focus:ring-1 focus:ring-[#210D15]"
        />
        <button
          type="submit"
          className="absolute right-1.5 top-1/2 -translate-y-1/2 px-2.5 py-1 bg-[#210D15] text-[#FAF8F5] text-[11px] font-medium rounded hover:bg-[#321721] transition"
        >
          Search
        </button>
      </form>

      {/* Error state */}
      {error && (
        <div className="p-4 bg-[#FEE2E2] border border-[#FCA5A5] text-[#991B1B] rounded-md text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Customers Table */}
      <div className="bg-[#FFFFFF] border border-[#E8E2D9] rounded-lg shadow-xs overflow-hidden">
        {loading ? (
          <div className="py-16 text-center text-xs text-[#70675E] space-y-2">
            <RefreshCw className="w-5 h-5 animate-spin mx-auto text-[#210D15]" />
            <p>Loading customers from Firestore...</p>
          </div>
        ) : customers.length === 0 ? (
          <div className="py-16 text-center text-xs text-[#70675E] space-y-3">
            <Users className="w-8 h-8 mx-auto text-[#C5BDB5]" />
            <p className="font-medium text-[#210D15]">No customers found</p>
            <p className="text-[11px] text-[#8C827A]">Customer records will appear here as orders or logins occur.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-[#2D2A26] min-w-[700px]">
              <thead className="bg-[#FAF8F5] border-b border-[#ECE6DE] text-[#696159] font-medium uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-3 px-4">Customer</th>
                  <th className="py-3 px-4">Phone</th>
                  <th className="py-3 px-4">Total Orders</th>
                  <th className="py-3 px-4">Lifetime Spend</th>
                  <th className="py-3 px-4">Created Date</th>
                  <th className="py-3 px-4 text-right">Support Notes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#ECE6DE]">
                {customers.map((c) => {
                  const dateStr = c.createdAt?.toDate
                    ? c.createdAt.toDate().toLocaleDateString('en-IN', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric',
                      })
                    : 'N/A';

                  return (
                    <tr key={c.uid} className="hover:bg-[#FAF8F5]/80 transition">
                      <td className="py-3.5 px-4">
                        <p className="font-semibold text-[#210D15]">{c.displayName || 'Customer'}</p>
                        <p className="text-[11px] text-[#70675E]">{c.email}</p>
                      </td>
                      <td className="py-3.5 px-4 text-[#554E46] font-mono">
                        {c.phoneNumber || '—'}
                      </td>
                      <td className="py-3.5 px-4 font-medium text-[#210D15]">
                        {c.totalOrders || 0} Order(s)
                      </td>
                      <td className="py-3.5 px-4 font-semibold text-[#15803D]">
                        ₹{(((c.totalSpendInPaise || 0) / 100)).toLocaleString('en-IN')}
                      </td>
                      <td className="py-3.5 px-4 text-[#70675E]">{dateStr}</td>
                      <td className="py-3.5 px-4 text-right">
                        <button
                          onClick={() => handleOpenNotes(c)}
                          className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-medium border border-[#D5CCC1] rounded hover:bg-[#FAF8F5] text-[#2D2A26] transition"
                        >
                          <FileText className="w-3.5 h-3.5" />
                          <span>Notes</span>
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

      {/* Support Notes Modal */}
      {selectedCustomer && (
        <div className="fixed inset-0 z-50 bg-[#210D15]/50 flex items-center justify-center p-4">
          <div className="bg-[#FFFFFF] rounded-xl shadow-xl max-w-lg w-full border border-[#E8E2D9] max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between p-5 border-b border-[#ECE6DE]">
              <div>
                <span className="text-[10px] uppercase font-mono tracking-wider text-[#8C827A]">
                  Customer CRM
                </span>
                <h3 className="font-serif font-bold text-lg text-[#210D15]">
                  {selectedCustomer.displayName || selectedCustomer.email}
                </h3>
              </div>
              <button
                onClick={() => setSelectedCustomer(null)}
                className="text-[#8C827A] hover:text-[#210D15] transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 space-y-4 text-xs">
              {/* Add Note Form */}
              <form onSubmit={handleAddNote} className="space-y-2">
                <label className="block text-[#554E46] font-medium">Add Internal Support Note</label>
                <textarea
                  value={newNote}
                  onChange={(e) => setNewNote(e.target.value)}
                  placeholder="Record customer support conversation, dietary queries, or shipping preferences..."
                  rows={3}
                  className="w-full px-3 py-2 border border-[#D5CCC1] rounded-md text-xs text-[#210D15] focus:outline-none focus:ring-1 focus:ring-[#210D15]"
                  required
                />
                <button
                  type="submit"
                  disabled={submittingNote || !newNote.trim()}
                  className="px-3.5 py-1.5 bg-[#210D15] text-[#FAF8F5] font-medium rounded text-xs hover:bg-[#321721] transition disabled:opacity-50"
                >
                  {submittingNote ? 'Saving...' : 'Add Note'}
                </button>
              </form>

              {/* Notes List */}
              <div className="pt-3 border-t border-[#ECE6DE] space-y-3">
                <h4 className="font-semibold text-[#70675E] uppercase tracking-wider text-[10px]">
                  Internal History ({notes.length})
                </h4>

                {loadingNotes ? (
                  <p className="text-[#8C827A] text-center py-4">Loading notes...</p>
                ) : notes.length === 0 ? (
                  <p className="text-[#8C827A] text-center py-4">No support notes recorded yet.</p>
                ) : (
                  <div className="space-y-2.5 max-h-60 overflow-y-auto">
                    {notes.map((n) => (
                      <div key={n.id} className="p-3 bg-[#FAF8F5] border border-[#ECE6DE] rounded-md space-y-1">
                        <p className="text-[#210D15] leading-relaxed">{n.note}</p>
                        <p className="text-[10px] text-[#8C827A]">
                          By {n.authorEmail}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
