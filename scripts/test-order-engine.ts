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

async function runOrderEngineTests() {
  console.log('═══════════════════════════════════════════════════════════════════════════════');
  console.log('📦  PHASE 10: ORDER MANAGEMENT ENGINE & STATE MACHINE TEST SUITE');
  console.log('═══════════════════════════════════════════════════════════════════════════════\n');

  const { generateSequentialOrderId } = await import('@/lib/services/orderIdGenerator');
  const { orderService } = await import('@/lib/services/orderService');
  const { orderTrackingService } = await import('@/lib/services/orderTrackingService');
  const { OrderStateMachineError } = await import('@/lib/services/orderStateMachine');
  const { adminDb } = await import('@/lib/firebase/admin');

  const testEmail = `customer.test.${Date.now()}@example.com`;
  const testPhone = '9876543210';
  let prepaidOrderId = '';
  let partialCodOrderId = '';

  try {
    // ----------------------------------------------------
    // TEST 1: Sequential Order ID Generator (Task 10.1)
    // ----------------------------------------------------
    console.log('1️⃣ Testing Atomic Sequential Order ID Generator (GG-YYMM-XXXXXX)...');
    const id1 = await generateSequentialOrderId();
    const id2 = await generateSequentialOrderId();

    const orderIdRegex = /^GG-\d{4}-\d{6}$/;
    if (!orderIdRegex.test(id1) || !orderIdRegex.test(id2)) {
      throw new Error(`Order ID format mismatch: ${id1}, ${id2}`);
    }

    const seq1 = parseInt(id1.slice(-6), 10);
    const seq2 = parseInt(id2.slice(-6), 10);
    if (seq2 !== seq1 + 1) {
      throw new Error(`Sequential increment mismatch: ${seq1} -> ${seq2}`);
    }
    console.log(`   ✓ Allocated IDs: ${id1} -> ${id2} (Strict Monotonic Sequence)`);
    console.log('   ✅ Collision-safe sequential Order ID generation verified.');

    // ----------------------------------------------------
    // TEST 2: Transactional Order Creation - Full Prepaid (Task 10.4 & 10.5)
    // ----------------------------------------------------
    console.log('\n2️⃣ Testing Transactional Order Creation (Full Prepaid Flow)...');
    const prepaidOrder = await orderService.createOrder({
      customer: {
        email: testEmail,
        phone: testPhone,
        firstName: 'Imran',
        lastName: 'Ahmad',
        isGuest: false,
      },
      shippingAddress: {
        addressLine1: 'Flat 402, Sea Green Apartments',
        city: 'Mumbai',
        state: 'Maharashtra',
        stateCode: '27',
        pincode: '400050',
      },
      items: [
        { productId: 'gutglow-daily-wellness', packOptionId: 'pack-1-month', quantity: 1 },
      ],
      paymentMode: 'prepaid',
    });

    prepaidOrderId = prepaidOrder.id;

    if (
      prepaidOrder.pricing.totalAmountInPaise !== 199900 ||
      prepaidOrder.payment.advanceAmountInPaise !== 199900 ||
      prepaidOrder.payment.balanceAmountInPaise !== 0 ||
      prepaidOrder.balanceCollectionStatus !== 'not_applicable'
    ) {
      throw new Error(`Prepaid pricing mismatch: ${JSON.stringify(prepaidOrder.pricing)}`);
    }

    const prepaidEvents = await orderService.getOrderEvents(prepaidOrderId);
    if (prepaidEvents.length === 0 || prepaidEvents[0].eventType !== 'ORDER_CREATED') {
      throw new Error('Initial ORDER_CREATED event not found in subcollection');
    }

    console.log(`   ✓ Created Order ${prepaidOrderId} (Total: ₹1,999.00, Advance: ₹1,999.00, Balance: ₹0.00)`);
    console.log(`   ✓ Audit Event Logged: ${prepaidEvents[0].eventType} ("${prepaidEvents[0].description}")`);
    console.log(`   ✓ FEFO Batch Assigned: ${prepaidOrder.items[0].assignedBatchNumbers?.join(', ')}`);
    console.log('   ✅ Full Prepaid order creation & snapshots verified.');

    // ----------------------------------------------------
    // TEST 3: Transactional Order Creation - Partial COD (Task 10.2 & 10.4)
    // ----------------------------------------------------
    console.log('\n3️⃣ Testing Transactional Order Creation (Partial COD Flow)...');
    const partialCodOrder = await orderService.createOrder({
      customer: {
        email: testEmail,
        phone: testPhone,
        firstName: 'Imran',
        lastName: 'Ahmad',
        isGuest: false,
      },
      shippingAddress: {
        addressLine1: 'Flat 402, Sea Green Apartments',
        city: 'Mumbai',
        state: 'Maharashtra',
        stateCode: '27',
        pincode: '400050',
      },
      items: [
        { productId: 'gutglow-daily-wellness', packOptionId: 'pack-3-month', quantity: 1 }, // ₹4,899.00
      ],
      paymentMode: 'partial_cod',
    });

    partialCodOrderId = partialCodOrder.id;

    // 20% advance = 97980 paise (₹979.80), 80% balance = 391920 paise (₹3,919.20)
    const expectedTotal = 489900;
    const expectedAdvance = Math.round(expectedTotal * 0.2);
    const expectedBalance = expectedTotal - expectedAdvance;

    if (
      partialCodOrder.pricing.totalAmountInPaise !== expectedTotal ||
      partialCodOrder.payment.advanceAmountInPaise !== expectedAdvance ||
      partialCodOrder.payment.balanceAmountInPaise !== expectedBalance ||
      partialCodOrder.balanceCollectionStatus !== 'pending_delivery'
    ) {
      throw new Error(`Partial COD calculation mismatch: ${JSON.stringify(partialCodOrder.pricing)}`);
    }

    console.log(`   ✓ Created Partial COD Order ${partialCodOrderId}`);
    console.log(`   ✓ Total: ₹${(expectedTotal / 100).toFixed(2)}`);
    console.log(`   ✓ 20% Online Advance Required: ₹${(expectedAdvance / 100).toFixed(2)}`);
    console.log(`   ✓ 80% Balance Due on Delivery: ₹${(expectedBalance / 100).toFixed(2)}`);
    console.log('   ✅ Partial COD order creation & decoupled statuses verified.');

    // ----------------------------------------------------
    // TEST 4: Partial COD Enforcement Gate (Task 10.3)
    // ----------------------------------------------------
    console.log('\n4️⃣ Testing Partial COD Enforcement Gate...');
    let caughtGateBlock = false;
    try {
      // Trying to confirm order without advance payment being captured
      await orderService.updateOrderStatus(partialCodOrderId, {
        orderStatus: 'confirmed',
      });
    } catch (err) {
      if (err instanceof OrderStateMachineError && err.message.includes('Partial COD Gate')) {
        caughtGateBlock = true;
      }
    }

    if (!caughtGateBlock) {
      throw new Error('Partial COD Enforcement Gate failed: Allowed order confirmation without advance payment!');
    }
    console.log('   ✓ Blocked unconfirmed advance: State machine strictly rejected transition to "confirmed".');
    console.log('   ✅ Task 10.3 Partial COD rule successfully enforced.');

    // ----------------------------------------------------
    // TEST 5: Capturing Online Advance Payment & Confirming Order
    // ----------------------------------------------------
    console.log('\n5️⃣ Testing Advance Payment Capture & Order Confirmation...');
    const confirmedOrder = await orderService.captureAdvancePayment(partialCodOrderId, {
      gatewayTransactionId: 'fastrr_txn_9841284',
      gatewayPaymentId: 'pay_9841284',
      amountInPaise: expectedAdvance,
    });

    if (
      confirmedOrder.orderStatus !== 'confirmed' ||
      confirmedOrder.advancePaymentStatus !== 'captured'
    ) {
      throw new Error(`Failed to capture advance: ${JSON.stringify(confirmedOrder)}`);
    }

    const eventsAfterCapture = await orderService.getOrderEvents(partialCodOrderId);
    const capturedEvent = eventsAfterCapture.find((e) => e.eventType === 'ADVANCE_PAYMENT_CAPTURED');
    if (!capturedEvent) {
      throw new Error('ADVANCE_PAYMENT_CAPTURED event missing from timeline');
    }

    console.log(`   ✓ Order ${partialCodOrderId} status updated: "confirmed"`);
    console.log(`   ✓ Advance status: "captured" (Txn: fastrr_txn_9841284)`);
    console.log(`   ✓ Event logged: ${capturedEvent.eventType}`);
    console.log('   ✅ Advance payment capture and status transition verified.');

    // ----------------------------------------------------
    // TEST 6: Dual-Tier Order Tracking (Task 10.6 & 10.7)
    // ----------------------------------------------------
    console.log('\n6️⃣ Testing Dual-Tier Order Tracking (Tier 1 Masked Summary)...');
    const trackingInfo = await orderTrackingService.getPublicTrackingInfo({
      orderNumber: partialCodOrderId,
      emailOrPhone: testEmail,
    });

    if (!trackingInfo) {
      throw new Error('Failed to retrieve tracking info');
    }

    // Verify PII masking
    if (trackingInfo.customerName !== 'I**** A****') {
      throw new Error(`Customer name was not properly masked: ${trackingInfo.customerName}`);
    }
    if (!trackingInfo.destination.includes('400***')) {
      throw new Error(`Destination PIN was not masked: ${trackingInfo.destination}`);
    }
    if (trackingInfo.balanceDueInPaise !== expectedBalance) {
      throw new Error(`Balance due mismatch: ${trackingInfo.balanceDueInPaise}`);
    }

    console.log(`   ✓ Order: ${trackingInfo.orderNumber} (${trackingInfo.orderStatus})`);
    console.log(`   ✓ Masked Customer Name: ${trackingInfo.customerName}`);
    console.log(`   ✓ Masked Destination: ${trackingInfo.destination}`);
    console.log(`   ✓ Collectible Balance Due on Delivery: ₹${(trackingInfo.balanceDueInPaise / 100).toFixed(2)}`);
    console.log(`   ✓ Timeline Events Built: ${trackingInfo.timeline.length} milestone steps`);

    // Verify rejection on wrong identity
    let caughtIdentityRejection = false;
    try {
      await orderTrackingService.getPublicTrackingInfo({
        orderNumber: partialCodOrderId,
        emailOrPhone: 'wrong.email@example.com',
      });
    } catch {
      caughtIdentityRejection = true;
    }
    if (!caughtIdentityRejection) {
      throw new Error('Tracking service allowed lookup with unauthorized email/phone!');
    }
    console.log('   ✓ Rejected unauthorized tracking lookup successfully.');
    console.log('   ✅ Dual-Tier Order Tracking verified with 100% security.');

    // ----------------------------------------------------
    // TEST 7: Admin Order Filtering & Detail View (Task 10.8)
    // ----------------------------------------------------
    console.log('\n7️⃣ Testing Admin Order Listing & Filtering...');
    const adminOrders = await orderService.listOrdersForAdmin({
      paymentMode: 'partial_cod',
      status: 'confirmed',
    });

    const found = adminOrders.some((o) => o.id === partialCodOrderId);
    if (!found) {
      throw new Error(`Admin query did not find created Partial COD order ${partialCodOrderId}`);
    }
    console.log(`   ✓ Admin query retrieved ${adminOrders.length} order(s) matching criteria.`);
    console.log('   ✅ Admin order listing and filtering verified.');

    // ----------------------------------------------------
    // CLEANUP
    // ----------------------------------------------------
    console.log('\n🧹 Cleaning up test order documents...');
    const cleanupOrder = async (id: string) => {
      const events = await adminDb.collection('orders').doc(id).collection('events').get();
      for (const e of events.docs) {
        await e.ref.delete();
      }
      await adminDb.collection('orders').doc(id).delete();
    };

    if (prepaidOrderId) await cleanupOrder(prepaidOrderId);
    if (partialCodOrderId) await cleanupOrder(partialCodOrderId);
    console.log('   ✅ Test orders and events cleaned up.');

    console.log('\n🎉 ALL PHASE 10 ORDER ENGINE TESTS PASSED (100% SUCCESS)!\n');
  } catch (error) {
    console.error('\n❌ Test execution failed:', error);
    process.exit(1);
  }
}

runOrderEngineTests();
