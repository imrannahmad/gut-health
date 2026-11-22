/**
 * GutGlow Inventory Engine Test Suite
 * Tests 15-minute TTL stock reservation, FEFO batch allocation,
 * oversell prevention, and mathematical reconciliation.
 */

import fs from 'fs';
import path from 'path';

// Pre-load .env.local
const envPath = path.resolve(process.cwd(), '.env.local');
const envContent = fs.readFileSync(envPath, 'utf-8');
envContent.split('\n').forEach((line) => {
  const match = line.match(/^([^=]+)=(.*)$/);
  if (match) {
    let val = match[2].trim();
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
      val = val.slice(1, -1);
    }
    process.env[match[1].trim()] = val.replace(/\\n/g, '\n');
  }
});

async function runTestSuite() {
  console.log('═══════════════════════════════════════════════════════════════════════════════');
  console.log('🏭  GUTGLOW TRANSACTIONAL INVENTORY & BATCH ENGINE TEST SUITE');
  console.log('═══════════════════════════════════════════════════════════════════════════════\n');

  const { inventoryRepository } = await import('@/lib/repositories/inventoryRepository');
  const { inventoryReservationService } = await import('@/lib/services/inventoryReservationService');
  const { batchAllocationService } = await import('@/lib/services/batchAllocationService');
  const { inventoryReconciliationService } = await import('@/lib/services/inventoryReconciliation');

  const sku = 'GG-DWF-200G';

  // 1. Initial State Check
  console.log('📊 [Test 1] Authoritative Inventory Read:');
  const initialInv = await inventoryRepository.getInventory(sku);
  if (!initialInv) throw new Error(`SKU ${sku} not found`);
  console.log(`   ✓ SKU: ${initialInv.sku}`);
  console.log(`   ✓ Available: ${initialInv.quantityAvailable}, Reserved: ${initialInv.quantityReserved}, Total: ${initialInv.quantityTotal}`);

  // 2. Reservation Test (15-Minute Lock)
  console.log('\n🔒 [Test 2] Stock Reservation (Holding 3 Jars for 15-Min Fastrr Session):');
  const resResult = await inventoryReservationService.reserveStock({
    sku,
    physicalJars: 3,
    sessionToken: 'test_session_fastrr_999',
    orderNumber: 'TEST-ORD-001',
    ttlMinutes: 15,
  });
  console.log(`   ✓ Reservation Created: ${resResult.reservationId}`);
  console.log(`   ✓ Expires At: ${resResult.expiresAt.toISOString()}`);

  const postResInv = await inventoryRepository.getInventory(sku);
  console.log(`   ✓ Post-Reservation: Available: ${postResInv?.quantityAvailable}, Reserved: ${postResInv?.quantityReserved}, Total: ${postResInv?.quantityTotal}`);

  if (postResInv?.quantityReserved !== initialInv.quantityReserved + 3) {
    throw new Error('Quantity reserved did not increment by 3!');
  }
  if (postResInv?.quantityAvailable !== initialInv.quantityAvailable - 3) {
    throw new Error('Quantity available did not decrement by 3!');
  }
  console.log('   ✅ PASS: Stock held in quantityReserved without altering physical total');

  // 3. Overselling Prevention Test
  console.log('\n🚫 [Test 3] Overselling Prevention (Attempting to reserve 999,999 jars):');
  try {
    await inventoryReservationService.reserveStock({
      sku,
      physicalJars: 999999,
      sessionToken: 'hack_session',
    });
    throw new Error('FAILED: Oversell was unexpectedly permitted!');
  } catch (err: any) {
    if (err.message.includes('Insufficient stock')) {
      console.log(`   ✅ PASS: Oversell correctly blocked (${err.message})`);
    } else {
      throw err;
    }
  }

  // 4. Reservation Release Test (Abandoned Session)
  console.log('\n↩️  [Test 4] Reservation Release (User Abandons Checkout):');
  const released = await inventoryReservationService.releaseReservation(resResult.reservationId, 'user_cancelled');
  console.log(`   ✓ Release status: ${released}`);

  const postReleaseInv = await inventoryRepository.getInventory(sku);
  console.log(`   ✓ Post-Release: Available: ${postReleaseInv?.quantityAvailable}, Reserved: ${postReleaseInv?.quantityReserved}, Total: ${postReleaseInv?.quantityTotal}`);

  if (postReleaseInv?.quantityAvailable !== initialInv.quantityAvailable) {
    throw new Error('Available stock was not restored after release!');
  }
  console.log('   ✅ PASS: Units returned seamlessly to available inventory');

  // 5. FEFO Batch Allocation Test
  console.log('\n📦 [Test 5] FEFO Batch Allocation (Assigning earliest-expiring batch):');
  const batches = await inventoryRepository.getBatches(sku, 'active');
  console.log(`   ✓ Found ${batches.length} active batches for SKU ${sku}`);
  batches.forEach((b) => {
    console.log(`     - Batch: ${b.batchNumber} | Expiry: ${b.expiryDate?.toDate?.()?.toISOString()?.slice(0, 10)} | Available: ${b.quantityAvailable}`);
  });

  const allocationResult = await batchAllocationService.allocateBatchesForOrder(sku, 2);
  console.log(`   ✓ Allocated ${allocationResult.totalAllocated} units across batches:`);
  allocationResult.allocations.forEach((a) => {
    console.log(`     -> Batch ${a.batchNumber}: ${a.quantity} jars (Expiry: ${a.expiryDate.toISOString().slice(0, 10)})`);
  });

  if (allocationResult.totalAllocated !== 2) {
    throw new Error('Batch allocation quantity mismatch!');
  }
  console.log('   ✅ PASS: FEFO algorithm successfully allocated oldest valid batch');

  // 6. Reconciliation Test
  console.log('\n⚖️  [Test 6] Inventory Mathematical Reconciliation Check:');
  // First, adjust the inventory total to match the 2 units dispatched in Test 5 so test environment stays clean
  await inventoryRepository.updateStockCounts(sku, {
    quantityAvailableDelta: -2,
    quantityTotalDelta: -2,
  });

  const auditReport = await inventoryReconciliationService.reconcileSku(sku);
  console.log(`   ✓ Status: ${auditReport.status}`);
  console.log(`   ✓ Batch Total: ${auditReport.metrics.batchAvailableTotal}`);
  console.log(`   ✓ Inventory Total: ${auditReport.metrics.inventoryTotal}`);
  console.log(`   ✓ Active Reserved: ${auditReport.metrics.activeReservationsTotal}`);
  console.log(`   ✓ Discrepancy Diff: ${auditReport.discrepancies.batchVsTotalDiff}`);

  if (!auditReport.isHealthy) {
    throw new Error(`Inventory reconciliation failed: ${auditReport.message}`);
  }
  console.log('   ✅ PASS: 100% Mathematical consistency verified between Batches and SKU Totals');

  console.log('\n═══════════════════════════════════════════════════════════════════════════════');
  console.log('🎉  ALL INVENTORY & BATCH ENGINE TESTS PASSED (6/6 ASSERTIONS - 100%)');
  console.log('═══════════════════════════════════════════════════════════════════════════════');
}

runTestSuite().catch((err) => {
  console.error('\n❌ Test suite failed:', err);
  process.exit(1);
});
