'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  ShoppingBag,
  Search,
  RefreshCw,
  AlertCircle,
  Eye,
  CheckCircle2,
  Clock,
  Truck,
  IndianRupee,
  X,
  CreditCard,
  MapPin,
  FileText,
  User,
} from 'lucide-react';

interface OrderItem {
  productId: string;
  productName: string;
  packOptionId: string;
  packName: string;
  baseSku: string;
  quantity: number;
  totalPhysicalJars: number;
  unitSellingPriceInPaise: number;
  lineGrossTotalInPaise: number;
  assignedBatchNumbers?: string[];
}

interface Order {
  id: string;
  orderNumber: string;
  customer: {
    uid?: string;
    email: string;
    phone: string;
    firstName: string;
    lastName: string;
  };
  shippingAddress: {
    addressLine1: string;
    addressLine2?: string;
    city: string;
    state: string;
    pincode: string;
    stateCode: string;
  };
  items: OrderItem[];
  pricing: {
    grossProductAmountInPaise: number;
    discountAmountInPaise: number;
    netProductPayableInPaise: number;
    shippingFeeInPaise: number;
    inclusiveGstInPaise?: number;
    totalGstAmountInPaise?: number;
    totalPayableInPaise?: number;
    totalAmountInPaise?: number;
    advanceAmountInPaise?: number;
    balanceAmountInPaise?: number;
    couponCode?: string;
  };
  paymentMode: 'prepaid' | 'partial_cod';
  payment?: {
    advanceAmountInPaise?: number;
    balanceAmountInPaise?: number;
    advanceStatus?: string;
    balanceStatus?: string;
  };
  advancePayment?: {
    advanceAmountInPaise: number;
    balanceDueInPaise: number;
  };
  orderStatus: 'pending_payment' | 'confirmed' | 'processing' | 'completed' | 'cancelled' | 'returned';
  advancePaymentStatus: 'unpaid' | 'captured' | 'failed';
  balanceCollectionStatus: 'not_applicable' | 'pending_delivery' | 'awaiting_collection_confirmation' | 'collected' | 'remitted';
  shipmentStatus: string;
  createdAt: any;
}

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [paymentFilter, setPaymentFilter] = useState<string>('all');

  // Selected Order for Detail Modal
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [updatingStatus, setUpdatingStatus] = useState(false);

  const fetchOrders = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({ limit: '50' });
      if (statusFilter !== 'all') params.append('status', statusFilter);
      if (paymentFilter !== 'all') params.append('paymentMode', paymentFilter);
      if (search.trim()) params.append('search', search.trim());

      const res = await fetch(`/api/v1/admin/orders?${params.toString()}`);
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || 'Failed to load orders');
      }
      setOrders(json.data || []);
    } catch (err: any) {
      setError(err.message || 'Error fetching orders');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [statusFilter, paymentFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchOrders();
  };

  const handleUpdateStatus = async (orderId: string, newStatus: string) => {
    setUpdatingStatus(true);
    try {
      const res = await fetch(`/api/v1/admin/orders/${orderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderStatus: newStatus }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || 'Failed to update order status');
      }
      alert(`Order ${orderId} updated to "${newStatus}"!`);
      // Update locally
      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? { ...o, orderStatus: newStatus as any } : o))
      );
      if (selectedOrder && selectedOrder.id === orderId) {
        setSelectedOrder({ ...selectedOrder, orderStatus: newStatus as any });
      }
    } catch (err: any) {
      alert(`Status update error: ${err.message}`);
    } finally {
      setUpdatingStatus(false);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-[#ECE6DE]">
        <div>
          <h1 className="text-2xl lg:text-3xl font-serif text-[#210D15] font-semibold tracking-tight">
            Orders & COD Fulfillment
          </h1>
          <p className="text-xs text-[#70675E] mt-1">
            Track orders, Partial COD advances vs courier balance collection, and FEFO batch allocations.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchOrders}
            disabled={loading}
            className="p-2 border border-[#D5CCC1] rounded-md text-[#554E46] hover:bg-[#FFFFFF] transition"
            title="Refresh Orders"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <Link
            href="/track-order"
            target="_blank"
            className="flex items-center gap-1.5 px-3.5 py-2 border border-[#D5CCC1] text-[#2D2A26] text-xs font-medium rounded-md hover:bg-[#FFFFFF] transition"
          >
            <span>Track Order Portal</span>
          </Link>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
        <form onSubmit={handleSearchSubmit} className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-[#8C827A] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by Order ID (GG-...), customer email or phone..."
            className="w-full pl-9 pr-20 py-2 bg-[#FFFFFF] border border-[#D5CCC1] rounded-md text-xs text-[#2D2A26] placeholder-[#8C827A] focus:outline-none focus:ring-1 focus:ring-[#210D15]"
          />
          <button
            type="submit"
            className="absolute right-1.5 top-1/2 -translate-y-1/2 px-2.5 py-1 bg-[#210D15] text-[#FAF8F5] text-[11px] font-medium rounded hover:bg-[#321721] transition"
          >
            Search
          </button>
        </form>

        <div className="flex flex-wrap items-center gap-2">
          {/* Status Tabs */}
          <div className="flex items-center gap-1 bg-[#EBE4DC] p-1 rounded-md text-xs overflow-x-auto no-scrollbar max-w-full">
            {['all', 'confirmed', 'processing', 'completed', 'cancelled'].map((s) => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={`px-2.5 py-1 rounded capitalize font-medium transition whitespace-nowrap ${
                  statusFilter === s
                    ? 'bg-[#FFFFFF] text-[#210D15] shadow-xs'
                    : 'text-[#696159] hover:text-[#210D15]'
                }`}
              >
                {s}
              </button>
            ))}
          </div>

          {/* Payment Mode Selector */}
          <select
            value={paymentFilter}
            onChange={(e) => setPaymentFilter(e.target.value)}
            className="px-3 py-1.5 bg-[#FFFFFF] border border-[#D5CCC1] rounded-md text-xs text-[#2D2A26] font-medium focus:outline-none focus:ring-1 focus:ring-[#210D15]"
          >
            <option value="all">All Payment Modes</option>
            <option value="prepaid">Prepaid Only</option>
            <option value="partial_cod">Partial COD Only</option>
          </select>
        </div>
      </div>

      {/* Error state */}
      {error && (
        <div className="p-4 bg-[#FEE2E2] border border-[#FCA5A5] text-[#991B1B] rounded-md text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Orders Table */}
      <div className="bg-[#FFFFFF] border border-[#E8E2D9] rounded-lg shadow-xs overflow-hidden">
        {loading ? (
          <div className="py-16 text-center text-xs text-[#70675E] space-y-2">
            <RefreshCw className="w-5 h-5 animate-spin mx-auto text-[#210D15]" />
            <p>Loading orders from Firestore...</p>
          </div>
        ) : orders.length === 0 ? (
          <div className="py-16 text-center text-xs text-[#70675E] space-y-3">
            <ShoppingBag className="w-8 h-8 mx-auto text-[#C5BDB5]" />
            <p className="font-medium text-[#210D15]">No orders found</p>
            <p className="text-[11px] text-[#8C827A]">Try clearing search or filters.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-[#2D2A26] min-w-[820px]">
              <thead className="bg-[#FAF8F5] border-b border-[#ECE6DE] text-[#696159] font-medium uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-3 px-4">Order ID</th>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Customer</th>
                  <th className="py-3 px-4">Items</th>
                  <th className="py-3 px-4">Payment</th>
                  <th className="py-3 px-4">Amount</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#ECE6DE]">
                {orders.map((o) => {
                  const dateStr = o.createdAt?.toDate
                    ? o.createdAt.toDate().toLocaleDateString('en-IN', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric',
                      })
                    : 'Recent';

                  const customerName = o.customer
                    ? `${o.customer.firstName || ''} ${o.customer.lastName || ''}`.trim()
                    : 'Customer';

                  const totalPaise = o.pricing?.totalAmountInPaise ?? o.pricing?.totalPayableInPaise ?? 0;
                  const advancePaise = o.payment?.advanceAmountInPaise ?? o.pricing?.advanceAmountInPaise ?? o.advancePayment?.advanceAmountInPaise ?? 0;
                  const balancePaise = o.payment?.balanceAmountInPaise ?? o.pricing?.balanceAmountInPaise ?? o.advancePayment?.balanceDueInPaise ?? 0;

                  return (
                    <tr key={o.id} className="hover:bg-[#FAF8F5]/80 transition">
                      {/* Order ID */}
                      <td className="py-3.5 px-4 font-mono font-semibold text-[#210D15]">
                        <span className="bg-[#F5F2EB] px-2 py-0.5 rounded border border-[#E8E2D9]">
                          {o.orderNumber || o.id}
                        </span>
                      </td>

                      {/* Date */}
                      <td className="py-3.5 px-4 text-[#70675E] whitespace-nowrap">
                        {dateStr}
                      </td>

                      {/* Customer */}
                      <td className="py-3.5 px-4">
                        <p className="font-medium text-[#210D15]">{customerName}</p>
                        <p className="text-[11px] text-[#70675E] truncate max-w-xs">{o.customer?.email}</p>
                      </td>

                      {/* Items */}
                      <td className="py-3.5 px-4">
                        <span className="font-medium text-[#210D15]">
                          {o.items?.length || 0} Item(s)
                        </span>
                        <p className="text-[11px] text-[#70675E] truncate max-w-xs">
                          {o.items?.[0]?.productName || 'Daily Wellness'}
                        </p>
                      </td>

                      {/* Payment Mode */}
                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium uppercase tracking-wider ${
                            o.paymentMode === 'partial_cod'
                              ? 'bg-[#FEF3C7] text-[#92400E]'
                              : 'bg-[#DCFCE7] text-[#166534]'
                          }`}
                        >
                          {o.paymentMode === 'partial_cod' ? 'Partial COD' : 'Prepaid'}
                        </span>
                      </td>

                      {/* Financials in INR */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <p className="font-semibold text-[#210D15]">
                          ₹{(totalPaise / 100).toLocaleString('en-IN')}
                        </p>
                        {o.paymentMode === 'partial_cod' && (
                          <p className="text-[10px] text-[#B45309]">
                            Adv: ₹{(advancePaise / 100).toLocaleString('en-IN')} | Bal: ₹{(balancePaise / 100).toLocaleString('en-IN')}
                          </p>
                        )}
                      </td>

                      {/* Order Status */}
                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium capitalize ${
                            o.orderStatus === 'confirmed'
                              ? 'bg-[#DCFCE7] text-[#166534]'
                              : o.orderStatus === 'processing'
                              ? 'bg-[#DBEAFE] text-[#1E40AF]'
                              : o.orderStatus === 'completed'
                              ? 'bg-[#EDE9FE] text-[#5B21B6]'
                              : o.orderStatus === 'cancelled'
                              ? 'bg-[#FEE2E2] text-[#991B1B]'
                              : 'bg-[#F3F4F6] text-[#4B5563]'
                          }`}
                        >
                          {o.orderStatus}
                        </span>
                      </td>

                      {/* Action */}
                      <td className="py-3.5 px-4 text-right">
                        <button
                          onClick={() => setSelectedOrder(o)}
                          className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-medium border border-[#D5CCC1] rounded hover:bg-[#FAF8F5] text-[#2D2A26] transition"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>View</span>
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

      {/* Order Detail View Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 bg-[#210D15]/50 flex items-center justify-center p-4">
          <div className="bg-[#FFFFFF] rounded-xl shadow-xl max-w-2xl w-full border border-[#E8E2D9] max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-5 border-b border-[#ECE6DE] sticky top-0 bg-[#FFFFFF] z-10">
              <div>
                <span className="text-[10px] uppercase font-mono tracking-wider text-[#8C827A]">
                  Order Details
                </span>
                <h3 className="font-serif font-bold text-xl text-[#210D15]">
                  {selectedOrder.orderNumber || selectedOrder.id}
                </h3>
              </div>
              <button
                onClick={() => setSelectedOrder(null)}
                className="text-[#8C827A] hover:text-[#210D15] transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-6 text-xs text-[#2D2A26]">
              {/* Quick Status Control */}
              <div className="p-4 bg-[#FAF8F5] border border-[#ECE6DE] rounded-lg flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div>
                  <span className="text-[11px] font-medium text-[#70675E]">Current Order Status:</span>
                  <p className="font-semibold text-sm capitalize text-[#210D15] mt-0.5">
                    {selectedOrder.orderStatus}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  {selectedOrder.orderStatus !== 'processing' && selectedOrder.orderStatus !== 'cancelled' && (
                    <button
                      onClick={() => handleUpdateStatus(selectedOrder.id, 'processing')}
                      disabled={updatingStatus}
                      className="px-3 py-1.5 bg-[#1E40AF] text-[#FFFFFF] rounded text-xs font-medium hover:bg-[#1D4ED8] transition disabled:opacity-50"
                    >
                      Mark Processing
                    </button>
                  )}
                  {selectedOrder.orderStatus !== 'completed' && selectedOrder.orderStatus !== 'cancelled' && (
                    <button
                      onClick={() => handleUpdateStatus(selectedOrder.id, 'completed')}
                      disabled={updatingStatus}
                      className="px-3 py-1.5 bg-[#166534] text-[#FFFFFF] rounded text-xs font-medium hover:bg-[#15803D] transition disabled:opacity-50"
                    >
                      Mark Completed
                    </button>
                  )}
                  {selectedOrder.orderStatus !== 'cancelled' && (
                    <button
                      onClick={() => handleUpdateStatus(selectedOrder.id, 'cancelled')}
                      disabled={updatingStatus}
                      className="px-3 py-1.5 bg-[#991B1B] text-[#FFFFFF] rounded text-xs font-medium hover:bg-[#B91C1C] transition disabled:opacity-50"
                    >
                      Cancel Order
                    </button>
                  )}
                </div>
              </div>

              {/* Customer & Shipping Details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 border border-[#ECE6DE] rounded-lg space-y-2">
                  <div className="flex items-center gap-1.5 text-[#210D15] font-semibold text-xs">
                    <User className="w-3.5 h-3.5" />
                    <span>Customer Details</span>
                  </div>
                  <p className="text-sm font-medium">
                    {selectedOrder.customer?.firstName} {selectedOrder.customer?.lastName}
                  </p>
                  <p className="text-[#70675E]">{selectedOrder.customer?.email}</p>
                  <p className="text-[#70675E]">{selectedOrder.customer?.phone}</p>
                </div>

                <div className="p-4 border border-[#ECE6DE] rounded-lg space-y-2">
                  <div className="flex items-center gap-1.5 text-[#210D15] font-semibold text-xs">
                    <MapPin className="w-3.5 h-3.5" />
                    <span>Shipping Address</span>
                  </div>
                  {selectedOrder.shippingAddress ? (
                    <>
                      <p>{selectedOrder.shippingAddress.addressLine1}</p>
                      {selectedOrder.shippingAddress.addressLine2 && <p>{selectedOrder.shippingAddress.addressLine2}</p>}
                      <p className="text-[#70675E]">
                        {selectedOrder.shippingAddress.city}, {selectedOrder.shippingAddress.state} - {selectedOrder.shippingAddress.pincode}
                      </p>
                      <p className="text-[10px] text-[#8C827A] font-mono">
                        GST State Code: {selectedOrder.shippingAddress.stateCode}
                      </p>
                    </>
                  ) : (
                    <p className="text-[#70675E]">No shipping address provided</p>
                  )}
                </div>
              </div>

              {/* Line Items & Batch Allocations */}
              <div className="space-y-2">
                <h4 className="font-semibold text-xs uppercase tracking-wider text-[#70675E]">
                  Line Items & Batch Allocations
                </h4>
                <div className="border border-[#ECE6DE] rounded-lg divide-y divide-[#ECE6DE] overflow-hidden">
                  {selectedOrder.items?.map((item, idx) => (
                    <div key={idx} className="p-3.5 flex items-center justify-between">
                      <div>
                        <p className="font-semibold text-[#210D15]">{item.productName}</p>
                        <p className="text-[11px] text-[#70675E]">
                          Pack: {item.packName} | SKU: {item.baseSku} | Units: {item.totalPhysicalJars}
                        </p>
                        {item.assignedBatchNumbers && item.assignedBatchNumbers.length > 0 && (
                          <p className="text-[10px] text-[#166534] mt-1 font-mono">
                            Allocated Batch(es): {item.assignedBatchNumbers.join(', ')}
                          </p>
                        )}
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-[#210D15]">
                          ₹{((item.lineGrossTotalInPaise || 0) / 100).toLocaleString('en-IN')}
                        </p>
                        <p className="text-[10px] text-[#70675E]">Qty: {item.quantity}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Financial Breakdown */}
              <div className="p-4 bg-[#FAF8F5] border border-[#ECE6DE] rounded-lg space-y-2">
                <div className="flex justify-between text-[#70675E]">
                  <span>Subtotal</span>
                  <span>₹{((selectedOrder.pricing?.grossProductAmountInPaise || 0) / 100).toLocaleString('en-IN')}</span>
                </div>
                {selectedOrder.pricing?.discountAmountInPaise > 0 && (
                  <div className="flex justify-between text-[#166534]">
                    <span>Discount {selectedOrder.pricing?.couponCode ? `(${selectedOrder.pricing.couponCode})` : ''}</span>
                    <span>-₹{(selectedOrder.pricing.discountAmountInPaise / 100).toLocaleString('en-IN')}</span>
                  </div>
                )}
                <div className="flex justify-between text-[#70675E]">
                  <span>Inclusive 18% GST</span>
                  <span>₹{(((selectedOrder.pricing?.totalGstAmountInPaise ?? selectedOrder.pricing?.inclusiveGstInPaise) || 0) / 100).toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between text-[#70675E]">
                  <span>Shipping Fee</span>
                  <span>{selectedOrder.pricing?.shippingFeeInPaise === 0 ? 'FREE' : `₹${(selectedOrder.pricing?.shippingFeeInPaise || 0) / 100}`}</span>
                </div>
                <div className="pt-2 border-t border-[#ECE6DE] flex justify-between font-bold text-sm text-[#210D15]">
                  <span>Total Payable</span>
                  <span>₹{(((selectedOrder.pricing?.totalAmountInPaise ?? selectedOrder.pricing?.totalPayableInPaise) || 0) / 100).toLocaleString('en-IN')}</span>
                </div>

                {selectedOrder.paymentMode === 'partial_cod' && (
                  <div className="pt-2 border-t border-[#ECE6DE] space-y-1 text-[11px]">
                    <div className="flex justify-between text-[#166534]">
                      <span>Online Advance Paid</span>
                      <span>₹{(((selectedOrder.payment?.advanceAmountInPaise ?? selectedOrder.pricing?.advanceAmountInPaise ?? selectedOrder.advancePayment?.advanceAmountInPaise) || 0) / 100).toLocaleString('en-IN')}</span>
                    </div>
                    <div className="flex justify-between text-[#92400E] font-semibold">
                      <span>Cash Balance Due on Delivery</span>
                      <span>₹{(((selectedOrder.payment?.balanceAmountInPaise ?? selectedOrder.pricing?.balanceAmountInPaise ?? selectedOrder.advancePayment?.balanceDueInPaise) || 0) / 100).toLocaleString('en-IN')}</span>
                    </div>
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
