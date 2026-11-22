/**
 * Concurrency Race Condition Test
 * Fires 20 simultaneous reservation requests contending for only 2 physical jars.
 * Asserts strict Firestore transaction isolation: exactly 2 succeed, exactly 18 fail, 0 overselling.
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

async function runConcurrencyRaceTest() {
  console.log('═══════════════════════════════════════════════════════════════════════════════');
  console.log('⚡  GUTGLOW CONCURRENCY RACE CONDITION TEST (20 Contenders for 2 Jars)');
  console.log('═══════════════════════════════════════════════════════════════════════════════\n');

  const { adminDb } = await import('@/lib/firebase/admin');
  const { inventoryReservationService } = await import('@/lib/services/inventoryReservationService');
  const { FieldValue } = await import('firebase-admin/firestore');

  const raceSku = 'TEST-CONCURRENCY-SKU';
  const initialAvailableStock = 2;
  const totalContenders = 20;

  // 1. Initialize Test SKU
  console.log(`1️⃣  Initializing ${raceSku} with exactly ${initialAvailableStock} available units...`);
  await adminDb.collection('inventory').doc(raceSku).set({
    sku: raceSku,
    name: 'Concurrency Stress Test Item',
    quantityAvailable: initialAvailableStock,
    quantityReserved: 0,
    quantityTotal: initialAvailableStock,
    lowStockThreshold: 1,
    isLowStock: false,
    trackInventory: true,
    allowBackorders: false,
    updatedAt: FieldValue.serverTimestamp(),
  });

  // 2. Fire 20 Simultaneous Requests
  console.log(`\n2️⃣  Firing ${totalContenders} simultaneous reservation requests in parallel...`);
  const promises = Array.from({ length: totalContenders }, (_, idx) => {
    return inventoryReservationService.reserveStock({
      sku: raceSku,
      physicalJars: 1,
      sessionToken: `race_user_session_${idx + 1}`,
      orderNumber: `RACE-ORD-${idx + 1}`,
    });
  });

  const results = await Promise.allSettled(promises);

  const successfulReservations = results.filter((r) => r.status === 'fulfilled');
  const rejectedReservations = results.filter((r) => r.status === 'rejected');

  console.log(`\n📊 Race Results:`);
  console.log(`   ✓ Total Requests: ${totalContenders}`);
  console.log(`   ✓ Fulfilled (Won Race): ${successfulReservations.length}`);
  console.log(`   ✓ Rejected (Blocked by Engine): ${rejectedReservations.length}`);

  // 3. Verify Final Inventory State
  const finalDoc = await adminDb.collection('inventory').doc(raceSku).get();
  const finalData = finalDoc.data();
  console.log(`\n3️⃣  Final Authoritative Inventory State:`);
  console.log(`   ✓ quantityAvailable: ${finalData?.quantityAvailable}`);
  console.log(`   ✓ quantityReserved: ${finalData?.quantityReserved}`);
  console.log(`   ✓ quantityTotal: ${finalData?.quantityTotal}`);

  // 4. Assertions
  if (successfulReservations.length !== initialAvailableStock) {
    throw new Error(
      `Oversell / Undersell detected! Expected exactly ${initialAvailableStock} successes, got ${successfulReservations.length}`
    );
  }

  if (rejectedReservations.length !== totalContenders - initialAvailableStock) {
    throw new Error(
      `Expected exactly ${totalContenders - initialAvailableStock} rejections, got ${rejectedReservations.length}`
    );
  }

  if (finalData?.quantityAvailable !== 0 || finalData?.quantityReserved !== initialAvailableStock) {
    throw new Error('Final inventory state does not match exact physical allocation!');
  }

  console.log('\n   ✅ ASSERTION PASSED: Exactly 2 requests succeeded, 18 rejected.');
  console.log('   ✅ ZERO OVERSELLING: Firestore transaction locking guaranteed 100% stock safety!');

  // 5. Cleanup
  console.log(`\n4️⃣  Cleaning up temporary ${raceSku}...`);
  await adminDb.collection('inventory').doc(raceSku).delete();
  console.log('   ✓ Cleanup complete.');

  console.log('\n═══════════════════════════════════════════════════════════════════════════════');
  console.log('🎉  CONCURRENCY RACE TEST PASSED WITH 100% ISOLATION INTEGRITY!');
  console.log('═══════════════════════════════════════════════════════════════════════════════');
}

runConcurrencyRaceTest().catch((err) => {
  console.error('\n❌ Concurrency race test failed:', err);
  process.exit(1);
});
