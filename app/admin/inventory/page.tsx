'use client';

import React, { useEffect, useState } from 'react';
import {
  Layers,
  Plus,
  RefreshCw,
  AlertTriangle,
  CheckCircle2,
  Clock,
  ShieldAlert,
  ArrowDownUp,
  X,
  History,
  FileCheck2,
} from 'lucide-react';

interface Batch {
  batchNumber: string;
  sku: string;
  expiryDate: any;
  manufacturingDate?: any;
  quantityInitial?: number;
  quantityTotal?: number;
  quantitySold?: number;
  quantityAllocated?: number;
  quantityAvailable: number;
  status: 'active' | 'quarantined' | 'depleted';
  notes?: string;
}

interface InventoryData {
  inventory: {
    sku: string;
    quantityAvailable: number;
    quantityReserved: number;
    totalPhysicalStock?: number;
    reconciledAt?: any;
  } | null;
  batches: Batch[];
  activeReservations: Array<{
    id: string;
    quantity: number;
    expiresAt: any;
  }>;
  reconciliation: {
    sku?: string;
    isHealthy?: boolean;
    status?: string;
    metrics?: {
      inventoryAvailable: number;
      inventoryReserved: number;
      inventoryTotal: number;
      batchAvailableTotal: number;
      activeReservationsTotal: number;
    };
    recordedAvailable?: number;
    sumActiveBatches?: number;
    isBalanced?: boolean;
    driftDelta?: number;
  } | null;
}

export default function AdminInventoryPage() {
  const [data, setData] = useState<InventoryData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAdjustModalOpen, setIsAdjustModalOpen] = useState(false);
  const [isReconciling, setIsReconciling] = useState(false);

  // Stock Adjustment Form State
  const [deltaQuantity, setDeltaQuantity] = useState<number>(0);
  const [reason, setReason] = useState<'production_receipt' | 'breakage' | 'damaged' | 'audit_count'>('production_receipt');
  const [batchNumber, setBatchNumber] = useState('');
  const [notes, setNotes] = useState('');
  const [submittingAdjust, setSubmittingAdjust] = useState(false);

  const fetchInventory = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/v1/admin/inventory');
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || 'Failed to load inventory');
      }
      setData(json.data);
      if (json.data?.batches?.[0]?.batchNumber) {
        setBatchNumber(json.data.batches[0].batchNumber);
      }
    } catch (err: any) {
      setError(err.message || 'Error fetching inventory data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInventory();
  }, []);

  const handleReconcile = async () => {
    setIsReconciling(true);
    try {
      const res = await fetch('/api/v1/admin/inventory/reconcile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sku: 'GG-DWF-200G', autoRepair: true }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || 'Reconciliation failed');
      }
      alert('Physical inventory reconciled successfully!');
      await fetchInventory();
    } catch (err: any) {
      alert(`Reconciliation error: ${err.message}`);
    } finally {
      setIsReconciling(false);
    }
  };

  const handleAdjustSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!deltaQuantity || deltaQuantity === 0) {
      alert('Please enter a non-zero adjustment quantity.');
      return;
    }
    setSubmittingAdjust(true);
    try {
      const res = await fetch('/api/v1/admin/inventory/adjust', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sku: 'GG-DWF-200G',
          deltaQuantity,
          reason,
          batchNumber: batchNumber || undefined,
          notes,
        }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || 'Adjustment failed');
      }
      alert(`Stock adjusted by ${deltaQuantity > 0 ? '+' : ''}${deltaQuantity} units successfully!`);
      setIsAdjustModalOpen(false);
      setDeltaQuantity(0);
      setNotes('');
      await fetchInventory();
    } catch (err: any) {
      alert(`Stock adjustment error: ${err.message}`);
    } finally {
      setSubmittingAdjust(false);
    }
  };

  const inventory = data?.inventory;
  const batches = data?.batches || [];
  const reservations = data?.activeReservations || [];
  const reconciliation = data?.reconciliation;

  const totalSold = batches.reduce((acc, b) => acc + (b.quantitySold || 0), 0);
  const totalManufactured = batches.reduce(
    (acc, b) =>
      acc + (b.quantityInitial ?? b.quantityTotal ?? (b.quantityAvailable + (b.quantitySold || 0))),
    0
  );

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-[#ECE6DE]">
        <div>
          <h1 className="text-2xl lg:text-3xl font-serif text-[#210D15] font-semibold tracking-tight">
            Physical Inventory & Batches
          </h1>
          <p className="text-xs text-[#70675E] mt-1">
            Real physical units count (SKU: GG-DWF-200G), FEFO batch allocation queue, and live order stock sync.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchInventory}
            disabled={loading}
            className="p-2 border border-[#D5CCC1] rounded-md text-[#554E46] hover:bg-[#FFFFFF] transition"
            title="Refresh Stock"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <button
            onClick={handleReconcile}
            disabled={isReconciling}
            className="flex items-center gap-1.5 px-3.5 py-2 border border-[#D5CCC1] text-[#2D2A26] text-xs font-medium rounded-md hover:bg-[#FFFFFF] transition"
          >
            <FileCheck2 className={`w-3.5 h-3.5 ${isReconciling ? 'animate-spin' : ''}`} />
            <span>Reconcile Stock</span>
          </button>
          <button
            onClick={() => setIsAdjustModalOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-[#210D15] text-[#FAF8F5] text-xs font-medium rounded-md hover:bg-[#321721] transition shadow-xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Adjust Stock</span>
          </button>
        </div>
      </div>

      {/* Error state */}
      {error && (
        <div className="p-4 bg-[#FEE2E2] border border-[#FCA5A5] text-[#991B1B] rounded-md text-xs flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Available Physical Stock */}
        <div className="bg-[#FFFFFF] border border-[#E8E2D9] rounded-lg p-5 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-[#857B72]">
            <span className="text-xs font-medium uppercase tracking-wider">Available Stock</span>
            <Layers className="w-4 h-4 text-[#15803D]" />
          </div>
          <div className="text-3xl font-serif font-bold text-[#210D15]">
            {loading ? '...' : inventory?.quantityAvailable ?? 0}{' '}
            <span className="text-xs font-normal text-[#857B72]">Units</span>
          </div>
          <p className="text-[11px] text-[#15803D] flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" />
            <span>Ready for Immediate Dispatch</span>
          </p>
        </div>

        {/* Total Units Sold */}
        <div className="bg-[#FFFFFF] border border-[#E8E2D9] rounded-lg p-5 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-[#857B72]">
            <span className="text-xs font-medium uppercase tracking-wider">Total Units Sold</span>
            <CheckCircle2 className="w-4 h-4 text-[#2563EB]" />
          </div>
          <div className="text-3xl font-serif font-bold text-[#210D15]">
            {loading ? '...' : totalSold}{' '}
            <span className="text-xs font-normal text-[#857B72]">Units</span>
          </div>
          <p className="text-[11px] text-[#70675E]">
            Fulfilled via Live Orders
          </p>
        </div>

        {/* Total Physical Stock */}
        <div className="bg-[#FFFFFF] border border-[#E8E2D9] rounded-lg p-5 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-[#857B72]">
            <span className="text-xs font-medium uppercase tracking-wider">Total Manufactured</span>
            <Layers className="w-4 h-4 text-[#210D15]" />
          </div>
          <div className="text-3xl font-serif font-bold text-[#210D15]">
            {loading ? '...' : totalManufactured}{' '}
            <span className="text-xs font-normal text-[#857B72]">Units</span>
          </div>
          <p className="text-[11px] text-[#70675E]">Base SKU: GG-DWF-200G</p>
        </div>

        {/* Reconciliation Status */}
        <div className="bg-[#FFFFFF] border border-[#E8E2D9] rounded-lg p-5 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-[#857B72]">
            <span className="text-xs font-medium uppercase tracking-wider">Stock Integrity</span>
            {(reconciliation?.isHealthy ?? reconciliation?.isBalanced ?? true) ? (
              <CheckCircle2 className="w-4 h-4 text-[#15803D]" />
            ) : (
              <AlertTriangle className="w-4 h-4 text-[#DC2626]" />
            )}
          </div>
          <div className="text-xl font-serif font-bold text-[#210D15]">
            {(reconciliation?.isHealthy ?? reconciliation?.isBalanced ?? true) ? (
              <span className="text-[#15803D]">100% Balanced</span>
            ) : (
              <span className="text-[#DC2626]">Drift Detected</span>
            )}
          </div>
          <p className="text-[11px] text-[#70675E]">
            Batches Available: {reconciliation?.metrics?.batchAvailableTotal ?? reconciliation?.sumActiveBatches ?? inventory?.quantityAvailable ?? 0} Units
          </p>
        </div>
      </div>

      {/* Batches Table */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-serif font-semibold text-[#210D15]">
            Physical Batches (FEFO Dispatch Order)
          </h2>
          <span className="text-xs text-[#70675E] font-medium">
            {batches.length} Batch(es) registered
          </span>
        </div>

        <div className="bg-[#FFFFFF] border border-[#E8E2D9] rounded-lg shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-[#2D2A26] min-w-[700px]">
              <thead className="bg-[#FAF8F5] border-b border-[#ECE6DE] text-[#696159] font-medium uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-3 px-4">Batch Number</th>
                  <th className="py-3 px-4">Expiry Date</th>
                  <th className="py-3 px-4">Total Manufactured</th>
                  <th className="py-3 px-4">Allocated / Sold</th>
                  <th className="py-3 px-4">Available</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Notes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#ECE6DE]">
                {batches.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-[#70675E]">
                      No batches found. Click "Adjust Stock" to add inventory.
                    </td>
                  </tr>
                ) : (
                  batches.map((b) => {
                    const expiryString = b.expiryDate?.toDate
                      ? b.expiryDate.toDate().toLocaleDateString('en-IN', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric',
                        })
                      : 'N/A';

                    return (
                      <tr key={b.batchNumber} className="hover:bg-[#FAF8F5]/80 transition">
                        <td className="py-3.5 px-4 font-mono font-semibold text-[#210D15]">
                          {b.batchNumber}
                        </td>
                        <td className="py-3.5 px-4 text-[#554E46] flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5 text-[#8C827A]" />
                          <span>{expiryString}</span>
                        </td>
                        <td className="py-3.5 px-4 font-medium text-[#210D15]">
                          {b.quantityInitial ?? b.quantityTotal ?? (b.quantityAvailable + (b.quantitySold || 0))} Units
                        </td>
                        <td className="py-3.5 px-4 text-[#70675E]">
                          {b.quantitySold ?? b.quantityAllocated ?? 0} Units
                        </td>
                        <td className="py-3.5 px-4">
                          <span className="font-semibold text-[#15803D]">
                            {b.quantityAvailable} Units
                          </span>
                        </td>
                        <td className="py-3.5 px-4">
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium capitalize ${
                              b.status === 'active'
                                ? 'bg-[#DCFCE7] text-[#166534]'
                                : b.status === 'quarantined'
                                ? 'bg-[#FEE2E2] text-[#991B1B]'
                                : 'bg-[#F3F4F6] text-[#4B5563]'
                            }`}
                          >
                            {b.status}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-[11px] text-[#8C827A] truncate max-w-xs">
                          {b.notes || '—'}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Stock Adjustment Modal */}
      {isAdjustModalOpen && (
        <div className="fixed inset-0 z-50 bg-[#210D15]/50 flex items-center justify-center p-4">
          <div className="bg-[#FFFFFF] rounded-xl shadow-xl max-w-md w-full border border-[#E8E2D9] overflow-hidden">
            <div className="flex items-center justify-between p-5 border-b border-[#ECE6DE]">
              <h3 className="font-serif font-semibold text-lg text-[#210D15]">
                Adjust Physical Stock
              </h3>
              <button
                onClick={() => setIsAdjustModalOpen(false)}
                className="text-[#8C827A] hover:text-[#210D15] transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAdjustSubmit} className="p-5 space-y-4 text-xs">
              <div>
                <label className="block text-[#554E46] font-medium mb-1">
                  Adjustment Delta (Positive or Negative Units)
                </label>
                <input
                  type="number"
                  value={deltaQuantity}
                  onChange={(e) => setDeltaQuantity(parseInt(e.target.value, 10) || 0)}
                  placeholder="e.g. 50 (to add) or -5 (for breakage)"
                  className="w-full px-3 py-2 border border-[#D5CCC1] rounded-md text-sm text-[#210D15] focus:outline-none focus:ring-1 focus:ring-[#210D15]"
                  required
                />
                <p className="text-[10px] text-[#8C827A] mt-1">
                  Enter positive number to increase physical stock, or negative number to write off.
                </p>
              </div>

              <div>
                <label className="block text-[#554E46] font-medium mb-1">Reason Code</label>
                <select
                  value={reason}
                  onChange={(e) => setReason(e.target.value as any)}
                  className="w-full px-3 py-2 border border-[#D5CCC1] rounded-md text-xs text-[#2D2A26] bg-[#FFFFFF] focus:outline-none focus:ring-1 focus:ring-[#210D15]"
                >
                  <option value="production_receipt">Production Receipt (New manufacturing)</option>
                  <option value="audit_count">Audit Count Adjustment (Physical inventory recount)</option>
                  <option value="breakage">Breakage / Warehouse Damage</option>
                  <option value="damaged">Quality Quarantine / Seal Tampered</option>
                </select>
              </div>

              <div>
                <label className="block text-[#554E46] font-medium mb-1">Batch Number</label>
                <input
                  type="text"
                  value={batchNumber}
                  onChange={(e) => setBatchNumber(e.target.value)}
                  placeholder="e.g. BATCH-2026-001"
                  className="w-full px-3 py-2 border border-[#D5CCC1] rounded-md text-xs text-[#210D15] focus:outline-none focus:ring-1 focus:ring-[#210D15]"
                />
              </div>

              <div>
                <label className="block text-[#554E46] font-medium mb-1">Audit Notes</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Reason for adjustment, manufacturer invoice number, or lab lot ID..."
                  rows={3}
                  className="w-full px-3 py-2 border border-[#D5CCC1] rounded-md text-xs text-[#210D15] focus:outline-none focus:ring-1 focus:ring-[#210D15]"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#ECE6DE]">
                <button
                  type="button"
                  onClick={() => setIsAdjustModalOpen(false)}
                  className="px-4 py-2 border border-[#D5CCC1] rounded-md text-[#554E46] hover:bg-[#FAF8F5] transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingAdjust}
                  className="px-5 py-2 bg-[#210D15] text-[#FAF8F5] font-medium rounded-md hover:bg-[#321721] transition disabled:opacity-50"
                >
                  {submittingAdjust ? 'Adjusting...' : 'Commit Adjustment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
