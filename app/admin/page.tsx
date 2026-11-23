import React from 'react';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { verifyAdminSession, ADMIN_COOKIE_NAME } from '@/lib/auth/rbac';
import { adminDb } from '@/lib/firebase/admin';
import { DashboardAnalytics, DashboardOrderRaw } from '@/components/admin/DashboardAnalytics';

export const instant = false;

export default async function AdminDashboardPage() {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get(ADMIN_COOKIE_NAME)?.value;
  const adminSession = await verifyAdminSession(sessionCookie);

  if (!adminSession) {
    redirect('/admin/login');
  }

  // Live metrics defaults
  let physicalStockTotal = 0;
  let activeBatchesCount = 0;
  let orders: DashboardOrderRaw[] = [];

  try {
    // 1. Fetch live orders from Firestore
    const ordersSnap = await adminDb
      .collection('orders')
      .orderBy('createdAt', 'desc')
      .limit(100)
      .get();

    orders = ordersSnap.docs.map((doc) => {
        const d = doc.data();
        const totalAmountInPaise =
          d.pricing?.totalAmountInPaise || d.pricing?.totalPayableInPaise || 0;
        const advanceAmountInPaise =
          d.pricing?.advanceAmountInPaise ||
          (d.paymentMode === 'prepaid' || d.payment?.mode === 'prepaid' ? totalAmountInPaise : 0);
        const balanceAmountInPaise =
          d.pricing?.balanceAmountInPaise ||
          (totalAmountInPaise > advanceAmountInPaise ? totalAmountInPaise - advanceAmountInPaise : 0);

        const createdAtMillis = d.createdAt?._seconds
          ? d.createdAt._seconds * 1000
          : Date.now();

        const rawCustomer = d.customer || {};
        const customerName = `${rawCustomer.firstName || ''} ${rawCustomer.lastName || ''}`.trim() || 'Valued Customer';

        return {
          id: doc.id,
          orderNumber: d.orderNumber || doc.id,
          orderStatus: d.orderStatus || d.status || 'confirmed',
          paymentMode: (d.payment?.mode || d.paymentMode || 'prepaid') as 'prepaid' | 'partial_cod',
          advancePaymentStatus: d.advancePaymentStatus || d.payment?.advanceStatus || 'captured',
          balanceCollectionStatus: d.balanceCollectionStatus || d.payment?.balanceStatus || 'not_applicable',
          shipmentStatus: d.shipmentStatus || d.shipment?.status || 'unfulfilled',
          totalAmountInPaise,
          advanceAmountInPaise,
          balanceAmountInPaise,
          customerName,
          customerEmail: rawCustomer.email || '',
          customerPhone: rawCustomer.phone || '',
          customerCity: d.shippingAddress?.city || 'Mumbai',
          customerState: d.shippingAddress?.state || 'Maharashtra',
          createdAtMillis,
          items: (d.items || []).map((it: any) => ({
            productId: it.productId || 'gutglow-daily-wellness',
            productName: it.productName || 'GutGlow Daily Wellness Formula',
            packName: it.packName || 'Daily Wellness Formula',
            packOptionId: it.packOptionId || 'pack-1-month',
            quantity: it.quantity || 1,
            totalPhysicalJars: it.totalPhysicalJars || 1,
            lineGrossTotalInPaise: it.lineGrossTotalInPaise || 0,
          })),
        };
      });

    // 2. Fetch inventory stock from Firestore
    const inventoryDoc = await adminDb.collection('inventory').doc('GG-DWF-200G').get();
    if (inventoryDoc.exists) {
      physicalStockTotal = inventoryDoc.data()?.quantityAvailable ?? physicalStockTotal;
    }

    // 3. Fetch active batches count
    const batchesSnap = await adminDb
      .collection('inventory')
      .doc('GG-DWF-200G')
      .collection('batches')
      .where('status', '==', 'active')
      .count()
      .get();
    activeBatchesCount = batchesSnap.data().count || activeBatchesCount;
  } catch (error) {
    console.warn('[Admin Dashboard] Live metric fetch notice:', error);
  }

  return (
    <DashboardAnalytics
      adminSession={{
        email: adminSession.email,
        role: adminSession.role,
      }}
      orders={orders}
      physicalStockTotal={physicalStockTotal}
      activeBatchesCount={activeBatchesCount}
    />
  );
}
