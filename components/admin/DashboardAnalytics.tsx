'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import {
  IndianRupee,
  ShoppingBag,
  TrendingUp,
  Layers,
  Clock,
  Truck,
  CheckCircle2,
  AlertCircle,
  ArrowUpRight,
  Calendar,
  PackageCheck,
  CreditCard,
  Users,
  BarChart3,
  PieChart,
  ArrowRight,
  ExternalLink,
  Eye,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';
import { formatPrice } from '@/lib/utils';

export interface DashboardOrderRaw {
  id: string;
  orderNumber: string;
  orderStatus: string;
  paymentMode: 'prepaid' | 'partial_cod';
  advancePaymentStatus?: string;
  balanceCollectionStatus?: string;
  shipmentStatus?: string;
  totalAmountInPaise: number;
  advanceAmountInPaise: number;
  balanceAmountInPaise: number;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  customerCity: string;
  customerState: string;
  createdAtMillis: number;
  items: {
    productId: string;
    productName: string;
    packName: string;
    packOptionId: string;
    quantity: number;
    totalPhysicalJars: number;
    lineGrossTotalInPaise: number;
  }[];
}

interface DashboardAnalyticsProps {
  adminSession: {
    email?: string;
    role: string;
  };
  orders: DashboardOrderRaw[];
  physicalStockTotal: number;
  activeBatchesCount: number;
}

type TimeHorizon = 'today' | '7d' | '30d' | 'all';

export function DashboardAnalytics({
  adminSession,
  orders,
  physicalStockTotal,
  activeBatchesCount,
}: DashboardAnalyticsProps) {
  const [timeHorizon, setTimeHorizon] = useState<TimeHorizon>('30d');
  const [hoveredBarIndex, setHoveredBarIndex] = useState<number | null>(null);

  // Filter orders according to active time horizon
  const filteredOrders = useMemo(() => {
    const now = Date.now();
    if (timeHorizon === 'today') {
      const startOfToday = new Date();
      startOfToday.setHours(0, 0, 0, 0);
      const startMillis = startOfToday.getTime();
      return orders.filter((o) => o.createdAtMillis >= startMillis);
    }
    if (timeHorizon === '7d') {
      const startMillis = now - 7 * 24 * 60 * 60 * 1000;
      return orders.filter((o) => o.createdAtMillis >= startMillis);
    }
    if (timeHorizon === '30d') {
      const startMillis = now - 30 * 24 * 60 * 60 * 1000;
      return orders.filter((o) => o.createdAtMillis >= startMillis);
    }
    return orders;
  }, [orders, timeHorizon]);

  // Financial & Order Volume Calculations
  const stats = useMemo(() => {
    let totalRevenuePaise = 0;
    let totalAdvancePaise = 0;
    let totalBalancePaise = 0;
    let prepaidCount = 0;
    let codCount = 0;

    filteredOrders.forEach((o) => {
      totalRevenuePaise += o.totalAmountInPaise;
      totalAdvancePaise += o.advanceAmountInPaise;
      totalBalancePaise += o.balanceAmountInPaise;
      if (o.paymentMode === 'prepaid') {
        prepaidCount++;
      } else {
        codCount++;
      }
    });

    const orderCount = filteredOrders.length;
    const aovPaise = orderCount > 0 ? Math.round(totalRevenuePaise / orderCount) : 0;
    const prepaidRatio = orderCount > 0 ? Math.round((prepaidCount / orderCount) * 100) : 0;

    return {
      revenue: totalRevenuePaise / 100,
      advance: totalAdvancePaise / 100,
      balance: totalBalancePaise / 100,
      orderCount,
      aov: aovPaise / 100,
      prepaidCount,
      codCount,
      prepaidRatio,
    };
  }, [filteredOrders]);

  // Pack Size & Formulation Distribution
  const packDistribution = useMemo(() => {
    const packMap: Record<
      string,
      { name: string; units: number; revenuePaise: number }
    > = {};

    filteredOrders.forEach((o) => {
      o.items.forEach((item) => {
        const key = item.packName || item.productName || 'Daily Wellness';
        if (!packMap[key]) {
          packMap[key] = { name: key, units: 0, revenuePaise: 0 };
        }
        packMap[key].units += item.quantity || 1;
        packMap[key].revenuePaise += item.lineGrossTotalInPaise || 0;
      });
    });

    const items = Object.values(packMap);
    const totalUnits = items.reduce((acc, p) => acc + p.units, 0);

    return items
      .map((p) => ({
        ...p,
        revenue: p.revenuePaise / 100,
        percentage: totalUnits > 0 ? Math.round((p.units / totalUnits) * 100) : 0,
      }))
      .sort((a, b) => b.units - a.units);
  }, [filteredOrders]);

  // 7-Day Velocity Chart Data Generator
  const dailyChartData = useMemo(() => {
    const days: {
      label: string;
      dateKey: string;
      revenue: number;
      orders: number;
    }[] = [];

    const now = new Date();
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const dateKey = d.toISOString().split('T')[0];
      const dayLabel = d.toLocaleDateString('en-US', { weekday: 'short' });
      days.push({
        label: `${dayLabel} ${d.getDate()}`,
        dateKey,
        revenue: 0,
        orders: 0,
      });
    }

    orders.forEach((o) => {
      const orderDate = new Date(o.createdAtMillis);
      const dateKey = orderDate.toISOString().split('T')[0];
      const dayEntry = days.find((d) => d.dateKey === dateKey);
      if (dayEntry) {
        dayEntry.revenue += o.totalAmountInPaise / 100;
        dayEntry.orders += 1;
      }
    });

    const maxRev = Math.max(...days.map((d) => d.revenue), 1000);
    return { days, maxRev };
  }, [orders]);

  // Operational Logistics Status Funnel
  const logisticsFunnel = useMemo(() => {
    let readyToPack = 0;
    let inTransit = 0;
    let delivered = 0;
    let exceptions = 0;

    orders.forEach((o) => {
      const s = (o.shipmentStatus || '').toLowerCase();
      const st = (o.orderStatus || '').toLowerCase();

      if (s === 'delivered' || st === 'completed') {
        delivered++;
      } else if (s === 'in_transit' || s === 'manifest_generated' || s === 'pickup_scheduled') {
        inTransit++;
      } else if (s === 'ndr_pending' || s === 'rto_initiated' || s === 'rto_delivered') {
        exceptions++;
      } else {
        readyToPack++;
      }
    });

    return { readyToPack, inTransit, delivered, exceptions };
  }, [orders]);

  // Inventory runway calculation
  const stockRunwayDays = useMemo(() => {
    const dailyBurn = orders.length > 0 ? orders.length / 7 : 0.5;
    if (dailyBurn <= 0) return 120;
    return Math.min(Math.round(physicalStockTotal / dailyBurn), 365);
  }, [physicalStockTotal, orders.length]);

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12">
      {/* =====================================================================
          TOP EXECUTIVE BANNER & DATE HORIZON FILTER
          ===================================================================== */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-6 border-b border-[#ECE6DE]">
        <div>
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-serif text-[#210D15] font-semibold tracking-tight">
            Executive Operations & Analytics
          </h1>
          <p className="text-xs text-[#70675E] mt-1 font-sans">
            Logged in as <strong className="text-[#210D15]">{adminSession.email}</strong> ({adminSession.role})
          </p>
        </div>

        {/* Date Filter & Fast Action Buttons */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          {/* Time Horizon Pills */}
          <div className="inline-flex items-center bg-[#EFEAE2] p-0.5 rounded-lg border border-[#E0D8CE] text-xs">
            {(
              [
                { id: 'today', label: 'Today' },
                { id: '7d', label: '7 Days' },
                { id: '30d', label: '30 Days' },
                { id: 'all', label: 'All Time' },
              ] as const
            ).map((tab) => (
              <button
                key={tab.id}
                onClick={() => setTimeHorizon(tab.id)}
                type="button"
                className={`px-3 py-1 rounded-md text-[11px] font-medium transition ${
                  timeHorizon === tab.id
                    ? 'bg-[#210D15] text-[#FAF8F5] shadow-xs'
                    : 'text-[#6B6158] hover:text-[#210D15]'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <Link
            href="/admin/orders"
            className="px-3.5 sm:px-4 py-2 bg-[#210D15] text-[#FAF8F5] text-xs font-medium rounded-md hover:bg-[#321721] transition shadow-xs flex items-center gap-1.5"
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            <span>Review Orders</span>
          </Link>
          <Link
            href="/admin/inventory"
            className="px-3.5 sm:px-4 py-2 border border-[#D5CCC1] text-[#2D2A26] text-xs font-medium rounded-md hover:bg-[#FFFFFF] transition flex items-center gap-1.5"
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Manage Stock</span>
          </Link>
        </div>
      </div>

      {/* =====================================================================
          EXECUTIVE FINANCIAL & COMMERCE KPI METRICS
          ===================================================================== */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1: Total Gross Sales / Net Revenue */}
        <div className="bg-[#FFFFFF] border border-[#E8E2D9] rounded-xl p-5 shadow-xs space-y-3 relative overflow-hidden group hover:border-[#D5CCC1] transition">
          <div className="flex items-center justify-between text-[#857B72]">
            <span className="text-xs font-medium uppercase tracking-wider font-mono">
              Gross Sales ({timeHorizon === 'all' ? 'All-Time' : timeHorizon})
            </span>
            <div className="p-2 rounded-lg bg-[#FAF8F5] text-[#210D15]">
              <IndianRupee className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-serif font-bold text-[#210D15] tracking-tight">
              {formatPrice(stats.revenue)}
            </div>
            <div className="flex items-center justify-between pt-2 mt-2 border-t border-[#F2ECE4] text-[11px] text-[#70675E]">
              <span className="flex items-center gap-1 text-[#2E7D32] font-semibold">
                <ArrowUpRight className="w-3 h-3" />
                <span>Realized Cash: {formatPrice(stats.advance)}</span>
              </span>
              <span className="text-[#857B72]">
                COD Bal: {formatPrice(stats.balance)}
              </span>
            </div>
          </div>
        </div>

        {/* Metric 2: Order Volume & Split */}
        <div className="bg-[#FFFFFF] border border-[#E8E2D9] rounded-xl p-5 shadow-xs space-y-3 relative overflow-hidden group hover:border-[#D5CCC1] transition">
          <div className="flex items-center justify-between text-[#857B72]">
            <span className="text-xs font-medium uppercase tracking-wider font-mono">
              Total Orders
            </span>
            <div className="p-2 rounded-lg bg-[#FAF8F5] text-[#210D15]">
              <ShoppingBag className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-serif font-bold text-[#210D15] tracking-tight">
              {stats.orderCount}{' '}
              <span className="text-xs font-sans font-normal text-[#857B72]">
                Confirmed
              </span>
            </div>
            <div className="flex items-center justify-between pt-2 mt-2 border-t border-[#F2ECE4] text-[11px]">
              <span className="text-[#1565C0] font-medium">
                {stats.prepaidCount} Prepaid ({stats.prepaidRatio}%)
              </span>
              <span className="text-[#857B72]">
                {stats.codCount} Partial COD
              </span>
            </div>
          </div>
        </div>

        {/* Metric 3: Average Order Value (AOV) */}
        <div className="bg-[#FFFFFF] border border-[#E8E2D9] rounded-xl p-5 shadow-xs space-y-3 relative overflow-hidden group hover:border-[#D5CCC1] transition">
          <div className="flex items-center justify-between text-[#857B72]">
            <span className="text-xs font-medium uppercase tracking-wider font-mono">
              Average Order Value (AOV)
            </span>
            <div className="p-2 rounded-lg bg-[#FAF8F5] text-[#210D15]">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-serif font-bold text-[#210D15] tracking-tight">
              {formatPrice(stats.aov)}
            </div>
            <div className="flex items-center gap-1.5 pt-2 mt-2 border-t border-[#F2ECE4] text-[11px] text-[#2E7D32]">
              <Sparkles className="w-3 h-3 text-[#B78103]" />
              <span>Multi-Pack Wellness Cart Health</span>
            </div>
          </div>
        </div>

        {/* Metric 4: Sellable Warehouse Stock & Runway */}
        <div className="bg-[#FFFFFF] border border-[#E8E2D9] rounded-xl p-5 shadow-xs space-y-3 relative overflow-hidden group hover:border-[#D5CCC1] transition">
          <div className="flex items-center justify-between text-[#857B72]">
            <span className="text-xs font-medium uppercase tracking-wider font-mono">
              Warehouse Inventory
            </span>
            <div className="p-2 rounded-lg bg-[#FAF8F5] text-[#210D15]">
              <Layers className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-serif font-bold text-[#210D15] tracking-tight">
              {physicalStockTotal}{' '}
              <span className="text-xs font-sans font-normal text-[#857B72]">
                Units
              </span>
            </div>
            <div className="flex items-center justify-between pt-2 mt-2 border-t border-[#F2ECE4] text-[11px]">
              <span className="text-[#2E7D32] font-semibold flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" />
                <span>~{stockRunwayDays} Days Runway</span>
              </span>
              <span className="text-[#857B72]">
                {activeBatchesCount} Active FEFO Lot
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* =====================================================================
          MIDDLE ROW: REVENUE TREND GRAPH + SUPPLY PACK DISTRIBUTION
          ===================================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: 7-Day Velocity & Revenue Trend Chart (8 cols) */}
        <div className="lg:col-span-8 bg-[#FFFFFF] border border-[#E8E2D9] rounded-xl p-6 shadow-xs flex flex-col justify-between">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 pb-4 border-b border-[#F2ECE4]">
            <div>
              <div className="flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-[#210D15]" />
                <h2 className="text-base font-serif font-semibold text-[#210D15]">
                  Daily Revenue & Order Velocity
                </h2>
              </div>
              <p className="text-xs text-[#857B72] mt-0.5">
                7-day rolling performance curve across prepaid & partial COD
              </p>
            </div>
            <div className="flex items-center gap-4 text-xs font-mono text-[#70675E]">
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded bg-[#210D15]" />
                <span>Revenue (₹)</span>
              </span>
            </div>
          </div>

          {/* Interactive Bar Chart Visualization */}
          <div className="pt-8 pb-4">
            <div className="h-44 w-full flex items-end justify-between gap-2 sm:gap-4 px-2">
              {dailyChartData.days.map((day, idx) => {
                const heightPercent =
                  dailyChartData.maxRev > 0
                    ? Math.max(Math.round((day.revenue / dailyChartData.maxRev) * 100), 8)
                    : 8;
                const isHovered = hoveredBarIndex === idx;

                return (
                  <div
                    key={day.dateKey}
                    onMouseEnter={() => setHoveredBarIndex(idx)}
                    onMouseLeave={() => setHoveredBarIndex(null)}
                    className="flex-1 flex flex-col items-center h-full justify-end group cursor-pointer relative"
                  >
                    {/* Tooltip on Hover */}
                    {isHovered && (
                      <div className="absolute -top-12 z-20 bg-[#210D15] text-[#FAF8F5] text-[10px] py-1 px-2.5 rounded shadow-lg whitespace-nowrap pointer-events-none transition-all">
                        <p className="font-semibold">{day.label}</p>
                        <p className="text-[#E8C5A5]">
                          {formatPrice(day.revenue)} · {day.orders} order(s)
                        </p>
                      </div>
                    )}

                    {/* Bar Column */}
                    <div className="w-full max-w-[48px] bg-[#FAF8F5] border border-[#E8E2D9] rounded-t-md h-full flex items-end overflow-hidden p-0.5 group-hover:border-[#210D15] transition-colors">
                      <div
                        style={{ height: `${heightPercent}%` }}
                        className={`w-full rounded-t-sm transition-all duration-500 ${
                          day.revenue > 0
                            ? 'bg-gradient-to-t from-[#210D15] to-[#3B2418] group-hover:from-[#3B2418] group-hover:to-[#5E3B27]'
                            : 'bg-[#E5DCD1]'
                        }`}
                      />
                    </div>

                    {/* Day X-Axis Label */}
                    <span className="text-[10px] font-mono text-[#857B72] mt-2 group-hover:text-[#210D15] font-medium">
                      {day.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Chart Summary Footer */}
          <div className="pt-4 border-t border-[#F2ECE4] flex flex-wrap items-center justify-between text-xs text-[#70675E]">
            <span>
              Highest Day:{' '}
              <strong className="text-[#210D15]">
                {formatPrice(dailyChartData.maxRev)}
              </strong>
            </span>
            <span className="text-[#2E7D32] font-medium">
              Average Velocity: {formatPrice(Math.round(stats.revenue / 7))}/day
            </span>
          </div>
        </div>

        {/* Right Column: Pack Size & Formulation Distribution (4 cols) */}
        <div className="lg:col-span-4 bg-[#FFFFFF] border border-[#E8E2D9] rounded-xl p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 pb-4 border-b border-[#F2ECE4]">
              <PieChart className="w-4 h-4 text-[#210D15]" />
              <div>
                <h2 className="text-base font-serif font-semibold text-[#210D15]">
                  Supply Pack Breakdown
                </h2>
                <p className="text-xs text-[#857B72]">
                  Customer pack preference & revenue share
                </p>
              </div>
            </div>

            {/* Pack Share List */}
            <div className="py-4 space-y-4">
              {packDistribution.length === 0 ? (
                <div className="py-8 text-center text-xs text-[#857B72]">
                  No sales recorded in this time horizon.
                </div>
              ) : (
                packDistribution.map((pack, idx) => (
                  <div key={pack.name} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-[#210D15] truncate max-w-[180px]">
                        {pack.name}
                      </span>
                      <span className="text-[#857B72] font-mono">
                        {pack.units} units ({pack.percentage}%)
                      </span>
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full h-2 rounded-full bg-[#EFEAE2] overflow-hidden">
                      <div
                        style={{ width: `${pack.percentage}%` }}
                        className={`h-full rounded-full transition-all duration-500 ${
                          idx === 0
                            ? 'bg-[#210D15]'
                            : idx === 1
                            ? 'bg-[#8BC5FF]'
                            : 'bg-[#B78103]'
                        }`}
                      />
                    </div>

                    <div className="flex justify-between text-[10px] text-[#857B72] font-mono">
                      <span>Total Revenue</span>
                      <span className="font-semibold text-[#210D15]">
                        {formatPrice(pack.revenue)}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="pt-3 border-t border-[#F2ECE4]">
            <Link
              href="/admin/products"
              className="text-xs text-[#210D15] font-semibold hover:underline flex items-center justify-between group"
            >
              <span>Manage Product Packs & Pricing</span>
              <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>
        </div>
      </div>

      {/* =====================================================================
          LOGISTICS & FULFILLMENT STATUS PIPELINE (D2C LIFELINE)
          ===================================================================== */}
      <div className="bg-[#FFFFFF] border border-[#E8E2D9] rounded-xl p-6 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 pb-3 border-b border-[#F2ECE4]">
          <div className="flex items-center gap-2">
            <Truck className="w-4 h-4 text-[#210D15]" />
            <h2 className="text-base font-serif font-semibold text-[#210D15]">
              Fulfillment & Dispatch Pipeline
            </h2>
          </div>
          <Link
            href="/admin/orders"
            className="text-xs font-semibold text-[#210D15] hover:underline flex items-center gap-1"
          >
            <span>Open Order Management</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* 4 Pipeline Stages */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-1">
          {/* Stage 1: Ready to Pack */}
          <Link
            href="/admin/orders"
            className="p-4 rounded-lg bg-[#FFFDF7] border border-[#EFEAE2] hover:border-[#210D15] transition space-y-2 block"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono uppercase tracking-wider text-[#857B72]">
                Ready to Pack
              </span>
              <span className="w-2 h-2 rounded-full bg-[#B78103]" />
            </div>
            <div className="text-2xl font-serif font-bold text-[#210D15]">
              {logisticsFunnel.readyToPack}
            </div>
            <p className="text-[11px] text-[#857B72]">
              Unfulfilled orders awaiting warehouse pack & manifest
            </p>
          </Link>

          {/* Stage 2: In Transit */}
          <Link
            href="/admin/orders"
            className="p-4 rounded-lg bg-[#FAF8F5] border border-[#EFEAE2] hover:border-[#210D15] transition space-y-2 block"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono uppercase tracking-wider text-[#857B72]">
                In Transit / Dispatched
              </span>
              <span className="w-2 h-2 rounded-full bg-[#1565C0]" />
            </div>
            <div className="text-2xl font-serif font-bold text-[#210D15]">
              {logisticsFunnel.inTransit}
            </div>
            <p className="text-[11px] text-[#857B72]">
              AWB allocated with Shiprocket / BlueDart couriers
            </p>
          </Link>

          {/* Stage 3: Delivered */}
          <Link
            href="/admin/orders"
            className="p-4 rounded-lg bg-[#FAF8F5] border border-[#EFEAE2] hover:border-[#210D15] transition space-y-2 block"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono uppercase tracking-wider text-[#857B72]">
                Delivered Successfully
              </span>
              <span className="w-2 h-2 rounded-full bg-[#2E7D32]" />
            </div>
            <div className="text-2xl font-serif font-bold text-[#210D15]">
              {logisticsFunnel.delivered}
            </div>
            <p className="text-[11px] text-[#857B72]">
              Customer handed over & COD collected
            </p>
          </Link>

          {/* Stage 4: Exceptions / RTO */}
          <Link
            href="/admin/returns"
            className="p-4 rounded-lg bg-[#FAF8F5] border border-[#EFEAE2] hover:border-[#210D15] transition space-y-2 block"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono uppercase tracking-wider text-[#857B72]">
                NDR / RTO Watch
              </span>
              <span className="w-2 h-2 rounded-full bg-[#D32F2F]" />
            </div>
            <div className="text-2xl font-serif font-bold text-[#210D15]">
              {logisticsFunnel.exceptions}
            </div>
            <p className="text-[11px] text-[#857B72]">
              Delivery attempts or return claims requiring action
            </p>
          </Link>
        </div>
      </div>

      {/* =====================================================================
          RECENT ORDERS LIVE FEED TABLE
          ===================================================================== */}
      <div className="bg-[#FFFFFF] border border-[#E8E2D9] rounded-xl p-6 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 pb-3 border-b border-[#F2ECE4]">
          <div>
            <h2 className="text-base font-serif font-semibold text-[#210D15]">
              Recent Orders Feed
            </h2>
            <p className="text-xs text-[#857B72]">
              Real-time customer transactions and fulfillment statuses
            </p>
          </div>
          <Link
            href="/admin/orders"
            className="text-xs font-semibold text-[#210D15] hover:underline flex items-center gap-1"
          >
            <span>View All {orders.length} Orders</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Orders Table */}
        <div className="overflow-x-auto -mx-6 px-6">
          <table className="w-full text-left text-xs font-sans">
            <thead>
              <tr className="border-b border-[#F2ECE4] text-[#857B72] font-mono text-[11px] uppercase tracking-wider">
                <th className="py-2.5 font-semibold">Order ID</th>
                <th className="py-2.5 font-semibold">Customer</th>
                <th className="py-2.5 font-semibold">Pack & Quantity</th>
                <th className="py-2.5 font-semibold">Payment</th>
                <th className="py-2.5 font-semibold">Amount</th>
                <th className="py-2.5 font-semibold">Status</th>
                <th className="py-2.5 font-semibold text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F2ECE4]">
              {orders.slice(0, 6).map((order) => {
                const isPrepaid = order.paymentMode === 'prepaid';

                return (
                  <tr
                    key={order.id}
                    className="hover:bg-[#FAF8F5] transition-colors"
                  >
                    <td className="py-3 font-mono font-semibold text-[#210D15]">
                      {order.orderNumber}
                    </td>
                    <td className="py-3">
                      <p className="font-medium text-[#210D15]">
                        {order.customerName}
                      </p>
                      <p className="text-[11px] text-[#857B72]">
                        {order.customerCity}, {order.customerState}
                      </p>
                    </td>
                    <td className="py-3 text-[#524B43]">
                      {order.items.length > 0 ? (
                        <span>
                          {order.items[0].packName || order.items[0].productName}{' '}
                          {order.items.length > 1 && `+${order.items.length - 1} more`}
                        </span>
                      ) : (
                        <span>Daily Wellness Formula</span>
                      )}
                    </td>
                    <td className="py-3">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold ${
                          isPrepaid
                            ? 'bg-[#E3F2FD] text-[#1565C0] border border-[#BBDEFB]'
                            : 'bg-[#FFF8E1] text-[#B78103] border border-[#FFE082]'
                        }`}
                      >
                        {isPrepaid ? 'Prepaid 100%' : 'Partial COD'}
                      </span>
                    </td>
                    <td className="py-3 font-mono font-bold text-[#210D15]">
                      {formatPrice(order.totalAmountInPaise / 100)}
                    </td>
                    <td className="py-3">
                      <span className="inline-flex items-center gap-1 text-[11px] font-medium text-[#2E7D32]">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#2E7D32]" />
                        <span className="capitalize">
                          {order.orderStatus || 'Confirmed'}
                        </span>
                      </span>
                    </td>
                    <td className="py-3 text-right">
                      <Link
                        href={`/admin/orders`}
                        className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#210D15] hover:text-[#5E3B27] border border-[#E8E2D9] px-2.5 py-1 rounded bg-[#FFFFFF] hover:bg-[#FAF8F5] transition"
                      >
                        <Eye className="w-3 h-3" />
                        <span>Inspect</span>
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* =====================================================================
          SYSTEM INFRASTRUCTURE & BACKEND HEALTH
          ===================================================================== */}
      <div className="bg-[#FFFFFF] border border-[#E8E2D9] rounded-xl p-6 shadow-xs space-y-4">
        <h2 className="text-base font-serif font-semibold text-[#210D15]">
          Backend Readiness & Infrastructure Status
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-1">
          <div className="p-4 rounded-lg bg-[#FAF8F5] border border-[#EFEAE2]">
            <p className="text-xs font-mono font-semibold text-[#210D15]">
              Database
            </p>
            <p className="text-xs text-[#524B43] mt-1">
              Cloud Firestore (asia-south1, Mumbai)
            </p>
            <span className="inline-block mt-2 px-2 py-0.5 rounded text-[10px] font-medium bg-[#E3F4E8] text-[#1D6A38]">
              ACTIVE
            </span>
          </div>

          <div className="p-4 rounded-lg bg-[#FAF8F5] border border-[#EFEAE2]">
            <p className="text-xs font-mono font-semibold text-[#210D15]">
              Security Standard
            </p>
            <p className="text-xs text-[#524B43] mt-1">
              Strict Deny-by-Default (firestore.rules)
            </p>
            <span className="inline-block mt-2 px-2 py-0.5 rounded text-[10px] font-medium bg-[#E3F4E8] text-[#1D6A38]">
              CONFIGURED
            </span>
          </div>

          <div className="p-4 rounded-lg bg-[#FAF8F5] border border-[#EFEAE2]">
            <p className="text-xs font-mono font-semibold text-[#210D15]">
              Authentication
            </p>
            <p className="text-xs text-[#524B43] mt-1">
              Firebase Auth + Custom Claims RBAC
            </p>
            <span className="inline-block mt-2 px-2 py-0.5 rounded text-[10px] font-medium bg-[#E3F4E8] text-[#1D6A38]">
              OPERATIONAL
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
