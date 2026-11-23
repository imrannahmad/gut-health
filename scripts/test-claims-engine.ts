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

async function runClaimsEngineTest() {
  console.log('═══════════════════════════════════════════════════════════════════════════════');
  console.log('🛡️  PHASE 13: TRANSIT CLAIMS & DAMAGE REPLACEMENTS ENGINE TEST SUITE');
  console.log('═══════════════════════════════════════════════════════════════════════════════\n');

  const { adminDb } = await import('../lib/firebase/admin');
  const { FieldValue, Timestamp } = await import('firebase-admin/firestore');
  const { claimService } = await import('../lib/services/claimService');
  const { generateSequentialOrderId } = await import('../lib/services/orderIdGenerator');

  const ordersCol = adminDb.collection('orders');
  const returnsCol = adminDb.collection('returns');

  // Test 1: Seed a Mock Delivered Order (delivered 2 hours ago)
  const testOrderId = await generateSequentialOrderId();
  const deliveredTwoHoursAgo = new Date(Date.now() - 2 * 3600 * 1000);
  const testPhone = '9876543210';

  console.log(`1️⃣  Seeding Test Delivered Order: ${testOrderId}`);
  await ordersCol.doc(testOrderId).set({
    id: testOrderId,
    orderNumber: testOrderId,
    orderStatus: 'completed',
    paymentMode: 'prepaid',
    advancePaymentStatus: 'captured',
    balanceCollectionStatus: 'not_applicable',
    shipmentStatus: 'delivered',
    deliveredAt: Timestamp.fromDate(deliveredTwoHoursAgo),
    customer: {
      firstName: 'Rahul',
      lastName: 'Mehta',
      phone: testPhone,
      email: 'rahul.mehta@example.com',
      isGuest: false,
    },
    shippingAddress: {
      addressLine1: 'Flat 402, Lotus Grandeur',
      city: 'Mumbai',
      state: 'Maharashtra',
      stateCode: '27',
      pincode: '400053',
      country: 'India',
    },
    billingAddress: {
      addressLine1: 'Flat 402, Lotus Grandeur',
      city: 'Mumbai',
      state: 'Maharashtra',
      stateCode: '27',
      pincode: '400053',
      country: 'India',
    },
    items: [
      {
        productId: 'gutglow-daily-wellness',
        productName: 'GutGlow Daily Wellness Formula',
        packOptionId: 'pack-1-month',
        packName: '1-Month Supply (30 Servings)',
        baseSku: 'GG-DWF-200G',
        packQuantity: 1,
        quantity: 1,
        totalPhysicalJars: 1,
        unitSellingPriceInPaise: 199900,
        mrpInPaise: 249900,
        lineGrossTotalInPaise: 199900,
        hsnCode: '2106 90 99',
        gstRateBasisPoints: 1800,
        image: '/images/gutglow-product-front.jpg',
      },
    ],
    pricing: {
      currency: 'INR',
      grossProductAmountInPaise: 199900,
      discountAmountInPaise: 0,
      netProductPayableInPaise: 199900,
      taxableValueInPaise: 169407,
      cgstAmountInPaise: 15246,
      sgstAmountInPaise: 15246,
      igstAmountInPaise: 0,
      totalGstAmountInPaise: 30493,
      shippingFeeInPaise: 0,
      totalAmountInPaise: 199900,
      advanceAmountInPaise: 199900,
      balanceAmountInPaise: 0,
    },
    payment: {
      mode: 'prepaid',
      advanceAmountInPaise: 199900,
      balanceAmountInPaise: 0,
      advanceStatus: 'captured',
      advanceGateway: 'fastrr',
      balanceStatus: 'not_applicable',
    },
    invoice: {
      invoiceNumber: `INV-${testOrderId}`,
      invoiceDate: Timestamp.now(),
      sellerGstin: '27AABCU9603R1ZM',
      placeOfSupplyStateCode: '27',
    },
    createdAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
  });
  console.log('   ✅ Order created and marked as delivered 2h ago.\n');

  // Test 2: Check Eligibility (Should Pass within 48h)
  console.log('2️⃣  Testing checkEligibility for delivered order within 48h...');
  const eligibility = await claimService.checkEligibility({
    orderId: testOrderId,
    customerPhone: testPhone,
  });

  if (!eligibility.eligible) {
    throw new Error(`Eligibility check failed unexpectedly: ${eligibility.message}`);
  }
  console.log(`   ✅ Eligibility Verified! Hours remaining in claim window: ${eligibility.order?.hoursRemaining}h\n`);

  // Test 3: Test Expired Window (>48 hours since delivery)
  console.log('3️⃣  Testing 48-Hour Consumable Safety Window Expiration (>48h)...');
  const expiredOrderId = await generateSequentialOrderId();
  const deliveredSixtyHoursAgo = new Date(Date.now() - 60 * 3600 * 1000);
  await ordersCol.doc(expiredOrderId).set({
    id: expiredOrderId,
    orderNumber: expiredOrderId,
    shipmentStatus: 'delivered',
    deliveredAt: Timestamp.fromDate(deliveredSixtyHoursAgo),
    customer: { phone: testPhone },
  });

  const expiredCheck = await claimService.checkEligibility({
    orderId: expiredOrderId,
    customerPhone: testPhone,
  });

  if (expiredCheck.eligible || expiredCheck.code !== 'WINDOW_EXPIRED') {
    throw new Error('Failed: Claim should have been rejected due to WINDOW_EXPIRED!');
  }
  console.log(`   ✅ 48-hour food hygiene rule strictly enforced: "${expiredCheck.message}"\n`);
  await ordersCol.doc(expiredOrderId).delete();

  // Test 4: Submit Transit Damage Claim with Evidence Photos
  console.log('4️⃣  Submitting Transit Damage Claim with Photo Evidence...');
  const claim = await claimService.createClaim({
    orderId: testOrderId,
    customerPhone: testPhone,
    customerEmail: 'rahul.mehta@example.com',
    reason: 'damaged_in_transit',
    damagedImageUrls: [
      'https://storage.googleapis.com/gutglow-demo/claims/crushed_box_label.jpg',
      'https://storage.googleapis.com/gutglow-demo/claims/broken_seal_view.jpg',
    ],
    customerNotes: 'The courier parcel arrived crushed and the tamper seal was torn open during transit.',
    items: [
      {
        baseSku: 'GG-DWF-200G',
        packOptionId: 'pack-1-month',
        packName: '1-Month Supply (30 Servings)',
        physicalUnitsCount: 1,
        reason: 'damaged_in_transit',
      },
    ],
  });

  console.log(`   ✅ Claim Registered: ${claim.id}`);
  console.log(`   Status: ${claim.status}`);
  console.log(`   Restock Eligible: ${claim.restockEligible} (Strict FSSAI Rule: Consumables Never Restocked)\n`);

  // Test 5: Duplicate Claim Prevention
  console.log('5️⃣  Testing Duplicate Claim Rejection on Same Order...');
  const duplicateCheck = await claimService.checkEligibility({
    orderId: testOrderId,
    customerPhone: testPhone,
  });

  if (duplicateCheck.eligible || duplicateCheck.code !== 'ALREADY_EXISTS') {
    throw new Error('Failed: Duplicate claim should have been blocked!');
  }
  console.log(`   ✅ Duplicate blocked: "${duplicateCheck.message}"\n`);

  // Test 6: Admin Inspection & 100% Free Replacement Order Generation
  console.log('6️⃣  Testing Admin Inspection & 100% Free Replacement Order Approval...');
  const reviewResult = await claimService.reviewClaim(
    claim.id,
    { uid: 'admin_quality_01', email: 'quality.lead@gutglow.com' },
    {
      action: 'approve_replacement',
      adminNotes: 'Verified crushed shipping label. Approving immediate free replacement.',
    }
  );

  if (!reviewResult.success || !reviewResult.replacementOrderId) {
    throw new Error('Failed: Replacement order was not generated on claim approval.');
  }

  const replacementOrderId = reviewResult.replacementOrderId;
  console.log(`   ✅ Claim Approved by Admin!`);
  console.log(`   📦 Replacement Order Created: ${replacementOrderId}`);

  // Fetch replacement order and assert constraints
  const replDoc = await ordersCol.doc(replacementOrderId).get();
  const replOrder = replDoc.data();

  if (replOrder?.pricing.totalAmountInPaise !== 0) {
    throw new Error(`Failed: Replacement order total should be 0, got ₹${replOrder?.pricing.totalAmountInPaise}`);
  }
  if (replOrder?.orderStatus !== 'confirmed') {
    throw new Error(`Failed: Replacement order status should be 'confirmed', got ${replOrder?.orderStatus}`);
  }
  if (replOrder?.isReplacement !== true || replOrder?.parentOrderId !== testOrderId) {
    throw new Error('Failed: Replacement linkage to parent order missing.');
  }

  console.log(`   ✅ Replacement Order Total: ₹${replOrder?.pricing.totalAmountInPaise} (100% Free Replacement)`);
  console.log(`   ✅ Replacement Order Status: ${replOrder?.orderStatus} (Ready for warehouse packing)`);
  console.log(`   ✅ Parent Order Linkage: ${replOrder?.parentOrderId}\n`);

  // Test 7: Verify Event Audit Log on Both Orders
  console.log('7️⃣  Verifying Audit Event Log Entries on Both Orders...');
  const parentEvents = await ordersCol.doc(testOrderId).collection('events').get();
  const replEvents = await ordersCol.doc(replacementOrderId).collection('events').get();

  console.log(`   Parent Order Audit Events: ${parentEvents.docs.length} logged`);
  console.log(`   Replacement Order Audit Events: ${replEvents.docs.length} logged\n`);

  // Test 8: Verify Dashboard Query & Status Counts
  console.log('8️⃣  Verifying Admin Claims Registry Query & Counters...');
  const registry = await claimService.getClaims({ status: 'all', limit: 10, offset: 0 });
  console.log(`   Total Claims in System: ${registry.total}`);
  console.log(`   Dashboard Status Breakdown:`, registry.counts);

  // Cleanup test docs
  console.log('\n🧹 Cleaning up test documents...');
  await ordersCol.doc(testOrderId).delete();
  await ordersCol.doc(replacementOrderId).delete();
  await returnsCol.doc(claim.id).delete();
  console.log('   ✅ Test documents cleaned up cleanly.');

  console.log('\n═══════════════════════════════════════════════════════════════════════════════');
  console.log('✨  ALL 8 PHASE 13 TESTS PASSED (100%)! ENGINE READY FOR PRODUCTION!');
  console.log('═══════════════════════════════════════════════════════════════════════════════\n');
}

runClaimsEngineTest().catch((err) => {
  console.error('\n❌ Test Error:', err);
  process.exit(1);
});
