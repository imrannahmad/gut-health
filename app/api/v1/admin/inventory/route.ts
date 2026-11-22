import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { inventoryRepository } from '@/lib/repositories/inventoryRepository';
import { inventoryReconciliationService } from '@/lib/services/inventoryReconciliation';
import { verifyAdminSession, hasPermission, ADMIN_COOKIE_NAME } from '@/lib/auth/rbac';
import { adminDb } from '@/lib/firebase/admin';
import { FieldValue, Timestamp } from 'firebase-admin/firestore';

async function getAdminUser() {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get(ADMIN_COOKIE_NAME)?.value;
  return verifyAdminSession(sessionCookie);
}

export async function GET() {
  try {
    const admin = await getAdminUser();
    if (!admin || !hasPermission(admin.role, 'inventory:read')) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 403 });
    }

    const sku = 'GG-DWF-200G';
    const [inventory, batches, activeReservations, reconciliation] = await Promise.all([
      inventoryRepository.getInventory(sku),
      inventoryRepository.getBatches(sku),
      inventoryRepository.getActiveReservations(sku),
      inventoryReconciliationService.reconcileSku(sku),
    ]);

    return NextResponse.json({
      success: true,
      data: {
        inventory,
        batches,
        activeReservations,
        reconciliation,
      },
    });
  } catch (error) {
    if ((error as any)?.digest?.startsWith?.('NEXT_PRERENDER')) {
      throw error;
    }
    console.error('[API] /api/v1/admin/inventory GET error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Internal Server Error',
      },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const admin = await getAdminUser();
    if (!admin || !hasPermission(admin.role, 'inventory:write')) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 403 });
    }

    const body = await request.json();
    const { action, sku = 'GG-DWF-200G' } = body;

    if (action === 'restock') {
      // Create new batch and add stock
      const { batchNumber, quantity, mrpInPaise = 249900, manufacturingDate, expiryDate } = body;
      if (!batchNumber || !quantity || quantity <= 0) {
        return NextResponse.json(
          { success: false, error: 'batchNumber and positive quantity are required.' },
          { status: 400 }
        );
      }

      const mfd = manufacturingDate ? Timestamp.fromDate(new Date(manufacturingDate)) : Timestamp.now();
      const exp = expiryDate ? Timestamp.fromDate(new Date(expiryDate)) : Timestamp.fromDate(new Date(Date.now() + 24 * 30 * 24 * 3600 * 1000));

      await adminDb.runTransaction(async (transaction) => {
        // 1. Create batch
        await inventoryRepository.updateBatch(
          sku,
          batchNumber,
          {
            batchNumber,
            sku,
            quantityInitial: quantity,
            quantityAvailable: quantity,
            quantitySold: 0,
            quantityQuarantined: 0,
            quantityDamaged: 0,
            mrpInPaise,
            status: 'active',
            manufacturingDate: mfd,
            expiryDate: exp,
            createdAt: FieldValue.serverTimestamp() as any,
          },
          transaction
        );

        // 2. Increase inventory total & available
        await inventoryRepository.updateStockCounts(
          sku,
          {
            quantityAvailableDelta: quantity,
            quantityTotalDelta: quantity,
          },
          transaction
        );

        // 3. Log to transactions
        await inventoryRepository.recordTransaction(
          {
            sku,
            type: 'restock',
            delta: quantity,
            previousStock: 0,
            newStock: quantity,
            referenceType: 'restock_po',
            referenceId: batchNumber,
            notes: `Restock received for batch ${batchNumber} (${quantity} units)`,
            operatorId: admin.email || admin.uid,
          },
          transaction
        );

        // 4. Audit Log
        await adminDb.collection('adminLogs').add({
          action: 'inventory.restocked',
          entityType: 'inventory',
          entityId: sku,
          performedBy: admin.email || admin.uid,
          metadata: { batchNumber, quantity },
          timestamp: FieldValue.serverTimestamp(),
        });
      });

      return NextResponse.json({ success: true, message: `Successfully restocked ${quantity} units for ${sku}.` });
    }

    if (action === 'quarantine_batch') {
      const { batchNumber, reason } = body;
      const batch = await inventoryRepository.getBatch(sku, batchNumber);
      if (!batch) {
        return NextResponse.json({ success: false, error: 'Batch not found' }, { status: 404 });
      }

      await adminDb.runTransaction(async (transaction) => {
        const availableInBatch = batch.quantityAvailable;

        await inventoryRepository.updateBatch(
          sku,
          batchNumber,
          {
            status: 'quarantined',
            quantityQuarantined: availableInBatch,
            quantityAvailable: 0,
          },
          transaction
        );

        // Deduct from available, but keep total for now until written off
        await inventoryRepository.updateStockCounts(
          sku,
          {
            quantityAvailableDelta: -availableInBatch,
            quantityTotalDelta: -availableInBatch,
          },
          transaction
        );

        await inventoryRepository.recordTransaction(
          {
            sku,
            type: 'manual_adjustment',
            delta: -availableInBatch,
            previousStock: availableInBatch,
            newStock: 0,
            referenceType: 'admin_adjustment',
            referenceId: batchNumber,
            notes: `Batch ${batchNumber} quarantined: ${reason || 'Quality review'}`,
            operatorId: admin.email || admin.uid,
          },
          transaction
        );

        await adminDb.collection('adminLogs').add({
          action: 'inventory.quarantined',
          entityType: 'batch',
          entityId: batchNumber,
          performedBy: admin.email || admin.uid,
          metadata: { batchNumber, quarantinedQuantity: availableInBatch, reason },
          timestamp: FieldValue.serverTimestamp(),
        });
      });

      return NextResponse.json({ success: true, message: `Batch ${batchNumber} placed under quarantine.` });
    }

    return NextResponse.json({ success: false, error: 'Invalid action. Expected "restock" or "quarantine_batch".' }, { status: 400 });
  } catch (error) {
    console.error('[API] /api/v1/admin/inventory POST error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Inventory mutation failed',
      },
      { status: 400 }
    );
  }
}
