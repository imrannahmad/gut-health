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

async function runCouponEngineTests() {
  console.log('═══════════════════════════════════════════════════════════════════════════════');
  console.log('🎟️  PHASE 11: PROMOTIONAL ENGINE & COUPON SYSTEM TEST SUITE');
  console.log('═══════════════════════════════════════════════════════════════════════════════\n');

  const { couponService } = await import('@/lib/services/couponService');
  const { orderService } = await import('@/lib/services/orderService');
  const { adminDb } = await import('@/lib/firebase/admin');

  const now = new Date();
  const nextMonth = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
  const pastDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const yesterday = new Date(Date.now() - 1 * 24 * 60 * 60 * 1000);

  const testCodes = {
    percentage: `TEST_PCT_${Date.now()}`,
    flat: `TEST_FLAT_${Date.now()}`,
    expired: `TEST_EXP_${Date.now()}`,
    singleUse: `TEST_ONCE_${Date.now()}`,
    firstTime: `TEST_NEW_${Date.now()}`,
  };

  const createdOrderIds: string[] = [];

  try {
    // ----------------------------------------------------
    // TEST 1: Percentage Coupon with Discount Cap (Task 11.1)
    // ----------------------------------------------------
    console.log('1️⃣ Testing Percentage Discount with Maximum Cap (15% off, max ₹500 cap)...');
    await couponService.createCoupon({
      code: testCodes.percentage,
      type: 'percentage',
      value: 15, // 15%
      minOrderValueInPaise: 199900, // ₹1,999.00
      maxDiscountAmountInPaise: 50000, // ₹500.00 cap
      maxTotalUses: 100,
      maxUsesPerCustomer: 2,
      isActive: true,
      startDate: now,
      endDate: nextMonth,
    });

    // Subtotal: ₹4,899.00 (489900 paise). 15% is 73485 paise, capped at 50000 paise (₹500.00)
    const pctResult = await couponService.validateCoupon({
      code: testCodes.percentage,
      subtotalInPaise: 489900,
      customerEmail: 'customer@example.com',
    });

    if (pctResult.discountAmountInPaise !== 50000) {
      throw new Error(`Discount cap failed: expected 50000 paise, got ${pctResult.discountAmountInPaise}`);
    }
    if (pctResult.netPayableInPaise !== 439900) {
      throw new Error(`Net payable mismatch: expected 439900, got ${pctResult.netPayableInPaise}`);
    }
    console.log(`   ✓ 15% of ₹4,899.00 = ₹734.85, correctly capped at ₹500.00 (${pctResult.discountAmountInPaise} paise)`);
    console.log(`   ✓ Net Payable: ₹${(pctResult.netPayableInPaise / 100).toFixed(2)}`);
    console.log('   ✅ Percentage discount with cap validated.');

    // ----------------------------------------------------
    // TEST 2: Flat Rupee Discount in Integer Paise
    // ----------------------------------------------------
    console.log('\n2️⃣ Testing Flat Rupee Discount in Integer Paise (Flat ₹300 OFF)...');
    await couponService.createCoupon({
      code: testCodes.flat,
      type: 'flat',
      value: 30000, // ₹300.00
      minOrderValueInPaise: 199900,
      maxTotalUses: 100,
      maxUsesPerCustomer: 1,
      isActive: true,
      startDate: now,
      endDate: nextMonth,
    });

    const flatResult = await couponService.validateCoupon({
      code: testCodes.flat,
      subtotalInPaise: 199900,
    });

    if (flatResult.discountAmountInPaise !== 30000 || flatResult.netPayableInPaise !== 169900) {
      throw new Error(`Flat discount mismatch: ${JSON.stringify(flatResult)}`);
    }
    console.log(`   ✓ Flat discount applied: ₹${(flatResult.discountAmountInPaise / 100).toFixed(2)} off on ₹1,999.00`);
    console.log(`   ✓ Net Payable: ₹${(flatResult.netPayableInPaise / 100).toFixed(2)}`);
    console.log('   ✅ Flat rupee discount validated.');

    // ----------------------------------------------------
    // TEST 3: Minimum Order Value Rejection (Task 11.5)
    // ----------------------------------------------------
    console.log('\n3️⃣ Testing Minimum Order Value Constraint...');
    let caughtMinOrder = false;
    try {
      // Cart subtotal ₹999.00 is below the ₹1,999.00 requirement
      await couponService.validateCoupon({
        code: testCodes.flat,
        subtotalInPaise: 99900,
      });
    } catch (err: any) {
      if (err.message.includes('Minimum order value')) {
        caughtMinOrder = true;
      }
    }
    if (!caughtMinOrder) {
      throw new Error('Minimum order value validation failed: Allowed discount on cart below threshold!');
    }
    console.log('   ✓ Rejected cart below ₹1,999.00 threshold successfully.');
    console.log('   ✅ Minimum order value rule verified.');

    // ----------------------------------------------------
    // TEST 4: Expired Coupon Rejection (Task 11.5)
    // ----------------------------------------------------
    console.log('\n4️⃣ Testing Expired Coupon Constraint...');
    await couponService.createCoupon({
      code: testCodes.expired,
      type: 'flat',
      value: 10000,
      minOrderValueInPaise: 100000,
      maxTotalUses: 10,
      maxUsesPerCustomer: 1,
      isActive: true,
      startDate: pastDate,
      endDate: yesterday, // Expired yesterday
    });

    let caughtExpired = false;
    try {
      await couponService.validateCoupon({
        code: testCodes.expired,
        subtotalInPaise: 200000,
      });
    } catch (err: any) {
      if (err.message.includes('has expired')) {
        caughtExpired = true;
      }
    }
    if (!caughtExpired) {
      throw new Error('Expired coupon validation failed: Allowed redemption of expired code!');
    }
    console.log('   ✓ Rejected expired coupon successfully.');
    console.log('   ✅ Expiration constraint verified.');

    // ----------------------------------------------------
    // TEST 5: Single-Use & Per-Customer Usage Limits (Task 11.5)
    // ----------------------------------------------------
    console.log('\n5️⃣ Testing Per-Customer Redemption Limits (maxUsesPerCustomer: 1)...');
    await couponService.createCoupon({
      code: testCodes.singleUse,
      type: 'flat',
      value: 20000,
      minOrderValueInPaise: 100000,
      maxTotalUses: 50,
      maxUsesPerCustomer: 1,
      isActive: true,
      startDate: now,
      endDate: nextMonth,
    });

    const userA = 'user.a@example.com';
    const userB = 'user.b@example.com';

    // 1st validation for User A succeeds
    const firstCheck = await couponService.validateCoupon({
      code: testCodes.singleUse,
      subtotalInPaise: 200000,
      customerEmail: userA,
    });
    if (!firstCheck.isValid) throw new Error('First redemption check failed for User A');

    // Simulate redemption
    await couponService.recordCouponUsage(testCodes.singleUse, { email: userA }, 'GG-TEST-001');

    // 2nd validation for User A must FAIL
    let caughtLimit = false;
    try {
      await couponService.validateCoupon({
        code: testCodes.singleUse,
        subtotalInPaise: 200000,
        customerEmail: userA,
      });
    } catch (err: any) {
      if (err.message.includes('maximum allowable times')) {
        caughtLimit = true;
      }
    }
    if (!caughtLimit) {
      throw new Error('Per-customer usage limit failed: Allowed second redemption for user.a@example.com!');
    }
    console.log('   ✓ Blocked second redemption attempt for user.a@example.com.');

    // Validation for User B must SUCCEED
    const userBCheck = await couponService.validateCoupon({
      code: testCodes.singleUse,
      subtotalInPaise: 200000,
      customerEmail: userB,
    });
    if (!userBCheck.isValid) throw new Error('User B was wrongly blocked by User A redemption');
    console.log('   ✓ Allowed first redemption for user.b@example.com.');
    console.log('   ✅ Per-customer limit verified.');

    // ----------------------------------------------------
    // TEST 6: Atomic Usage Increment in Order Creation (Task 11.3)
    // ----------------------------------------------------
    console.log('\n6️⃣ Testing Atomic Usage Increment During Order Creation...');
    const couponBefore = await couponService.getCoupon(testCodes.flat);
    const usesBefore = couponBefore?.currentUses || 0;

    const orderWithCoupon = await orderService.createOrder({
      customer: {
        email: 'coupon.buyer@example.com',
        phone: '9876543210',
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
        { productId: 'gutglow-daily-wellness', packOptionId: 'pack-1-month', quantity: 1 }, // ₹1,999.00
      ],
      paymentMode: 'prepaid',
      couponCode: testCodes.flat, // ₹300 OFF
    });

    createdOrderIds.push(orderWithCoupon.id);

    // Verify discount applied to order pricing
    if (orderWithCoupon.pricing.discountAmountInPaise !== 30000) {
      throw new Error(`Order discount mismatch: expected 30000 paise, got ${orderWithCoupon.pricing.discountAmountInPaise}`);
    }
    // Net: 199900 - 30000 = 169900 paise (₹1,699.00). Subtotal is still >= 150000 so shipping is 0
    if (orderWithCoupon.pricing.totalAmountInPaise !== 169900) {
      throw new Error(`Order total mismatch after discount: expected 169900, got ${orderWithCoupon.pricing.totalAmountInPaise}`);
    }

    const couponAfter = await couponService.getCoupon(testCodes.flat);
    const usesAfter = couponAfter?.currentUses || 0;
    if (usesAfter !== usesBefore + 1) {
      throw new Error(`Coupon usage was not atomically incremented: before ${usesBefore}, after ${usesAfter}`);
    }

    console.log(`   ✓ Created Order ${orderWithCoupon.id} with coupon "${testCodes.flat}"`);
    console.log(`   ✓ Discount Applied: ₹${(orderWithCoupon.pricing.discountAmountInPaise / 100).toFixed(2)}`);
    console.log(`   ✓ Final Order Total: ₹${(orderWithCoupon.pricing.totalAmountInPaise / 100).toFixed(2)}`);
    console.log(`   ✓ Coupon currentUses incremented: ${usesBefore} -> ${usesAfter}`);
    console.log('   ✅ Atomic coupon usage increment during checkout verified.');

    // ----------------------------------------------------
    // TEST 7: Admin Coupon CRUD Operations (Task 11.4)
    // ----------------------------------------------------
    console.log('\n7️⃣ Testing Admin Coupon Listing & Update Operations...');
    const allCoupons = await couponService.listCoupons();
    if (allCoupons.length < 3) {
      throw new Error(`Admin listing failed: expected at least 3 coupons, got ${allCoupons.length}`);
    }

    // Update coupon status
    const updated = await couponService.updateCoupon(testCodes.flat, {
      isActive: false,
    });
    if (updated.isActive !== false) {
      throw new Error('Failed to update coupon active status');
    }
    console.log(`   ✓ Admin coupon updated: isActive -> false`);
    console.log(`   ✓ Admin listing retrieved ${allCoupons.length} coupons.`);
    console.log('   ✅ Admin CRUD operations verified.');

    // ----------------------------------------------------
    // CLEANUP
    // ----------------------------------------------------
    console.log('\n🧹 Cleaning up test coupons and orders...');
    for (const code of Object.values(testCodes)) {
      const usagesSnap = await adminDb.collection('coupons').doc(code).collection('usages').get();
      for (const u of usagesSnap.docs) {
        await u.ref.delete();
      }
      await couponService.deleteCoupon(code);
    }

    for (const oId of createdOrderIds) {
      const eventsSnap = await adminDb.collection('orders').doc(oId).collection('events').get();
      for (const e of eventsSnap.docs) {
        await e.ref.delete();
      }
      await adminDb.collection('orders').doc(oId).delete();
    }
    console.log('   ✅ Test data cleaned up.');

    console.log('\n🎉 ALL PHASE 11 COUPON SYSTEM TESTS PASSED (100% SUCCESS)!\n');
  } catch (error) {
    console.error('\n❌ Test execution failed:', error);
    process.exit(1);
  }
}

runCouponEngineTests();
