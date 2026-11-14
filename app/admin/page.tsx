import React from 'react';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { verifyAdminSession, ADMIN_COOKIE_NAME } from '@/lib/auth/rbac';
import { adminDb } from '@/lib/firebase/admin';
import Link from 'next/link';
import {
  ShoppingBag,
  Layers,
  Clock,
  ArrowUpRight,
  AlertCircle,
  Truck,
  CheckCircle2,
} from 'lucide-react';

export const instant = false;

export default async function AdminDashboardPage() {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get(ADMIN_COOKIE_NAME)?.value;
  const adminSession = await verifyAdminSession(sessionCookie);

  if (!adminSession) {
    redirect('/admin/login');
  }

  // Fetch summary stats from Firestore
  let orderCount = 0;
  let physicalStockTotal = 0;
  let activeBatchesCount = 0;

  try {
    const ordersSnap = await adminDb.collection('orders').count().get();
    orderCount = ordersSnap.data().count;

    const inventoryDoc = await adminDb.collection('inventory').doc('GG-DWF-200G').get();
    if (inventoryDoc.exists) {
      physicalStockTotal = inventoryDoc.data()?.quantityAvailable || 0;
    }

    const batchesSnap = await adminDb
      .collection('inventory')
      .doc('GG-DWF-200G')
      .collection('batches')
      .where('status', '==', 'active')
      .count()
      .get();
    activeBatchesCount = batchesSnap.data().count;
  } catch (error) {
    console.warn('[Admin Dashboard] Metric fetch notice:', error);
  }

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-[#ECE6DE]">
        <div>
          <h1 className="text-2xl lg:text-3xl font-serif text-[#210D15] font-semibold tracking-tight">
            Executive Operations Dashboard
          </h1>
          <p className="text-xs text-[#70675E] mt-1 font-sans">
            Logged in as <strong className="text-[#210D15]">{adminSession.email}</strong> ({adminSession.role})
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/admin/inventory"
            className="px-4 py-2 bg-[#210D15] text-[#FAF8F5] text-xs font-medium rounded-md hover:bg-[#321721] transition shadow-sm"
          >
            Manage Stock
          </Link>
          <Link
            href="/admin/orders"
            className="px-4 py-2 border border-[#D5CCC1] text-[#2D2A26] text-xs font-medium rounded-md hover:bg-[#FFFFFF] transition"
          >
            Review Orders
          </Link>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Orders */}
        <div className="bg-[#FFFFFF] border border-[#E8E2D9] rounded-lg p-5 shadow-sm space-y-3">
          <div className="flex items-center justify-between text-[#857B72]">
            <span className="text-xs font-medium uppercase tracking-wider">Total Orders</span>
            <ShoppingBag className="w-4 h-4 text-[#210D15]" />
          </div>
          <div>
            <div className="text-2xl font-serif font-bold text-[#210D15]">{orderCount}</div>
            <p className="text-[11px] text-[#6B6158] mt-1">Confirmed & Processing</p>
          </div>
        </div>

        {/* Physical Stock */}
        <div className="bg-[#FFFFFF] border border-[#E8E2D9] rounded-lg p-5 shadow-sm space-y-3">
          <div className="flex items-center justify-between text-[#857B72]">
            <span className="text-xs font-medium uppercase tracking-wider">Base Physical Stock</span>
            <Layers className="w-4 h-4 text-[#210D15]" />
          </div>
          <div>
            <div className="text-2xl font-serif font-bold text-[#210D15]">
              {physicalStockTotal}{' '}
              <span className="text-xs font-normal text-[#857B72]">Jars</span>
            </div>
            <p className="text-[11px] text-[#2F7E4E] mt-1 flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" />
              <span>SKU: GG-DWF-200G</span>
            </p>
          </div>
        </div>

        {/* Active Batches */}
        <div className="bg-[#FFFFFF] border border-[#E8E2D9] rounded-lg p-5 shadow-sm space-y-3">
          <div className="flex items-center justify-between text-[#857B72]">
            <span className="text-xs font-medium uppercase tracking-wider">Active Batches</span>
            <Clock className="w-4 h-4 text-[#210D15]" />
          </div>
          <div>
            <div className="text-2xl font-serif font-bold text-[#210D15]">{activeBatchesCount}</div>
            <p className="text-[11px] text-[#857B72] mt-1">FEFO Allocation Engine</p>
          </div>
        </div>

        {/* Partial COD Status */}
        <div className="bg-[#FFFFFF] border border-[#E8E2D9] rounded-lg p-5 shadow-sm space-y-3">
          <div className="flex items-center justify-between text-[#857B72]">
            <span className="text-xs font-medium uppercase tracking-wider">Payment Flow</span>
            <Truck className="w-4 h-4 text-[#210D15]" />
          </div>
          <div>
            <div className="text-sm font-semibold text-[#210D15]">Prepaid & Partial COD</div>
            <p className="text-[11px] text-[#6B6158] mt-1">Advance Online + Balance Delivery</p>
          </div>
        </div>
      </div>

      {/* Quick Launchpad & Status Table */}
      <div className="bg-[#FFFFFF] border border-[#E8E2D9] rounded-lg p-6 shadow-sm space-y-4">
        <h2 className="text-base font-serif font-semibold text-[#210D15]">
          Backend Readiness & Infrastructure Status
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
          <div className="p-4 rounded-md bg-[#FAF8F5] border border-[#EFEAE2]">
            <p className="text-xs font-mono font-semibold text-[#210D15]">Database</p>
            <p className="text-xs text-[#524B43] mt-1">Cloud Firestore (asia-south1, Mumbai)</p>
            <span className="inline-block mt-2 px-2 py-0.5 rounded text-[10px] font-medium bg-[#E3F4E8] text-[#1D6A38]">
              ACTIVE
            </span>
          </div>

          <div className="p-4 rounded-md bg-[#FAF8F5] border border-[#EFEAE2]">
            <p className="text-xs font-mono font-semibold text-[#210D15]">Security Standard</p>
            <p className="text-xs text-[#524B43] mt-1">Strict Deny-by-Default (firestore.rules)</p>
            <span className="inline-block mt-2 px-2 py-0.5 rounded text-[10px] font-medium bg-[#E3F4E8] text-[#1D6A38]">
              CONFIGURED
            </span>
          </div>

          <div className="p-4 rounded-md bg-[#FAF8F5] border border-[#EFEAE2]">
            <p className="text-xs font-mono font-semibold text-[#210D15]">Authentication</p>
            <p className="text-xs text-[#524B43] mt-1">Firebase Auth + Custom Claims RBAC</p>
            <span className="inline-block mt-2 px-2 py-0.5 rounded text-[10px] font-medium bg-[#E3F4E8] text-[#1D6A38]">
              OPERATIONAL
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
