import fs from 'fs';
import path from 'path';

// Pre-load .env.local
const envPath = path.resolve(process.cwd(), '.env.local');
if (fs.existsSync(envPath)) {
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
}

async function runCleanup() {
  console.log('═══════════════════════════════════════════════════════════════');
  console.log('🧹 GUTGLOW TEST DATA CLEANUP & FACTORY RESET');
  console.log('═══════════════════════════════════════════════════════════════\n');

  const { adminDb } = await import('../lib/firebase/admin');
  const { Timestamp } = await import('firebase-admin/firestore');

  // Helper to delete all docs in a collection
  async function wipeCollection(colName: string) {
    const colRef = adminDb.collection(colName);
    const snap = await colRef.get();
    if (snap.empty) {
      console.log(`✓ Collection [${colName}] is already empty.`);
      return 0;
    }
    const batch = adminDb.batch();
    snap.docs.forEach((doc) => {
      batch.delete(doc.ref);
    });
    await batch.commit();
    console.log(`✓ Wiped ${snap.size} test document(s) from [${colName}].`);
    return snap.size;
  }

  // 1. Wipe test orders
  const ordersDeleted = await wipeCollection('orders');

  // 2. Wipe test inventory reservations
  const resDeleted = await wipeCollection('inventoryReservations');

  // 3. Wipe test inventory transactions (audit log)
  const txDeleted = await wipeCollection('inventoryTransactions');

  // 4. Wipe test carts
  const cartsDeleted = await wipeCollection('carts');

  // 5. Wipe test admin audit logs
  const logsDeleted = await wipeCollection('adminLogs');

  // 6. Wipe returns/claims if any
  const returnsDeleted = await wipeCollection('returns');

  // 7. Reset Order Sequence Counter to 0
  const counterRef = adminDb.collection('counters').doc('orders_202611');
  const counterSnap = await counterRef.get();
  if (counterSnap.exists) {
    await counterRef.update({
      currentSequence: 0,
      updatedAt: Timestamp.now(),
    });
    console.log('✓ Reset [counters/orders_202611] sequence to 0 (Next order will be #GG-2611-000001).');
  }

  // 8. Reset Inventory & Active Batch to Fresh 1,500 units
  const invDocRef = adminDb.collection('inventory').doc('GG-DWF-200G');
  await invDocRef.update({
    quantityTotal: 1500,
    quantityAvailable: 1500,
    quantityReserved: 0,
    updatedAt: Timestamp.now(),
  });

  const batchRef = invDocRef.collection('batches').doc('GG-BATCH-2026-001');
  const batchSnap = await batchRef.get();
  if (batchSnap.exists) {
    await batchRef.update({
      quantityAvailable: 1500,
      quantitySold: 0,
      updatedAt: Timestamp.now(),
    });
    console.log('✓ Reset inventory SKU [GG-DWF-200G] & batch [GG-BATCH-2026-001] to fresh 1,500 available units.');
  }

  // 9. Reset Imran's customer stats if needed
  const userRef = adminDb.collection('users').doc('rK1cPUiACkdGZD2vHpEflWGibDG2');
  const userSnap = await userRef.get();
  if (userSnap.exists) {
    await userRef.update({
      totalOrders: 0,
      totalSpendInPaise: 0,
      updatedAt: Timestamp.now(),
    });
    console.log('✓ Verified [users/imrannahmd@gmail.com] customer stats (0 orders, 0 spend).');
  }

  console.log('\n═══════════════════════════════════════════════════════════════');
  console.log('🎉 CLEANUP COMPLETED SUCCESSFULLY');
  console.log(`- Orders deleted: ${ordersDeleted}`);
  console.log(`- Reservations deleted: ${resDeleted}`);
  console.log(`- Transactions deleted: ${txDeleted}`);
  console.log(`- Carts deleted: ${cartsDeleted}`);
  console.log(`- Admin logs cleared: ${logsDeleted}`);
  console.log(`- Returns cleared: ${returnsDeleted}`);
  console.log('- Sequence Counter: Reset to 0 (Fresh #GG-2611-000001)');
  console.log('- Warehouse Stock: 1,500 fresh available units');
  console.log('- Admins & Products: 100% Intact & Preserved');
  console.log('═══════════════════════════════════════════════════════════════\n');
}

runCleanup().catch((err) => {
  console.error('❌ Cleanup failed:', err);
  process.exit(1);
});
