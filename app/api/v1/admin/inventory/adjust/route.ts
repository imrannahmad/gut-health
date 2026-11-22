import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { inventoryRepository } from '@/lib/repositories/inventoryRepository';
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

    const body = await request.json();
    const { sku = 'GG-DWF-200G', delta, reason, referenceId } = body;

    if (typeof delta !== 'number' || delta === 0) {
      return NextResponse.json(
        { success: false, error: 'delta must be a non-zero integer number.' },
        { status: 400 }
      );
    }

    await adminDb.runTransaction(async (transaction) => {
      const inv = await inventoryRepository.getInventory(sku, transaction);
      if (!inv) throw new Error(`SKU ${sku} not found`);

      if (inv.quantityAvailable + delta < 0) {
        throw new Error(`Cannot adjust stock below 0. Current available: ${inv.quantityAvailable}, adjustment: ${delta}`);
      }

      await inventoryRepository.updateStockCounts(
        sku,
        {
          quantityAvailableDelta: delta,
          quantityTotalDelta: delta,
        },
        transaction
      );

      await inventoryRepository.recordTransaction(
        {
          sku,
          type: 'manual_adjustment',
          delta,
          previousStock: inv.quantityAvailable,
          newStock: inv.quantityAvailable + delta,
          referenceType: 'admin_adjustment',
          referenceId: referenceId || `ADJ-${Date.now()}`,
          notes: reason || 'Manual admin inventory adjustment',
          operatorId: admin.email || admin.uid,
        },
        transaction
      );

      await adminDb.collection('adminLogs').add({
        action: 'inventory.adjusted',
        entityType: 'inventory',
        entityId: sku,
        performedBy: admin.email || admin.uid,
        metadata: { delta, reason },
        timestamp: FieldValue.serverTimestamp(),
      });
    });

    return NextResponse.json({
      success: true,
      message: `Stock for ${sku} adjusted by ${delta > 0 ? '+' + delta : delta} units.`,
    });
  } catch (error) {
    console.error('[API] /api/v1/admin/inventory/adjust POST error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Stock adjustment failed',
      },
      { status: 400 }
    );
  }
}
