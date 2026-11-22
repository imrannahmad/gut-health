import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { inventoryReconciliationService } from '@/lib/services/inventoryReconciliation';
import { verifyAdminSession, hasPermission, ADMIN_COOKIE_NAME } from '@/lib/auth/rbac';
import { adminDb } from '@/lib/firebase/admin';
import { FieldValue } from 'firebase-admin/firestore';

async function getAdminUser() {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get(ADMIN_COOKIE_NAME)?.value;
  return verifyAdminSession(sessionCookie);
}

export async function POST(request: Request) {
  try {
    const admin = await getAdminUser();
    if (!admin || !hasPermission(admin.role, 'inventory:write')) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 403 });
    }

    const body = await request.json().catch(() => ({}));
    const { sku = 'GG-DWF-200G', autoRepair = false } = body;

    let report;
    if (autoRepair) {
      report = await inventoryReconciliationService.repairInventoryDrift(sku, admin.email || admin.uid);
      await adminDb.collection('adminLogs').add({
        action: 'inventory.reconciled_and_repaired',
        entityType: 'inventory',
        entityId: sku,
        performedBy: admin.email || admin.uid,
        metadata: { report },
        timestamp: FieldValue.serverTimestamp(),
      });
    } else {
      report = await inventoryReconciliationService.reconcileSku(sku);
    }

    return NextResponse.json({
      success: true,
      data: report,
    });
  } catch (error) {
    console.error('[API] /api/v1/admin/inventory/reconcile POST error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Reconciliation failed',
      },
      { status: 500 }
    );
  }
}
