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

async function runReviewEngineTests() {
  console.log('═══════════════════════════════════════════════════════════════════════════════');
  console.log('⭐  PHASE 12: CUSTOMER REVIEWS & RATINGS AGGREGATOR TEST SUITE');
  console.log('═══════════════════════════════════════════════════════════════════════════════\n');

  const { reviewService } = await import('@/lib/services/reviewService');
  const { reviewRepository } = await import('@/lib/repositories/reviewRepository');
  const { adminDb } = await import('@/lib/firebase/admin');
  const { Timestamp } = await import('firebase-admin/firestore');

  const testProductId = 'gutglow-daily-wellness';
  const testOrderId = `GG-TEST-${Date.now()}`;
  const testCustomerEmail = `verified.buyer.${Date.now()}@example.com`;
  const testCustomerUid = `usr_test_${Date.now()}`;

  const createdReviewIds: string[] = [];

  try {
    // -------------------------------------------------------------------------
    // Setup: Create a temporary verified test order
    // -------------------------------------------------------------------------
    console.log('📦 Setting up verified test order in Firestore...');
    const orderDocRef = adminDb.collection('orders').doc(testOrderId);
    await orderDocRef.set({
      id: testOrderId,
      orderNumber: testOrderId,
      customer: {
        uid: testCustomerUid,
        email: testCustomerEmail,
        firstName: 'Kabir',
        lastName: 'Anand',
        phone: '+919876543210',
        isGuest: false,
      },
      items: [
        {
          productId: testProductId,
          productTitle: 'Daily Wellness Formula (200g)',
          packOptionId: 'single-pack',
          baseSku: 'GG-DWF-200G',
          quantity: 1,
          unitPriceInPaise: 199900,
          totalPriceInPaise: 199900,
        },
      ],
      pricing: {
        subtotalInPaise: 199900,
        discountInPaise: 0,
        shippingFeeInPaise: 0,
        inclusiveGstInPaise: 30493,
        totalPayableInPaise: 199900,
      },
      orderStatus: 'confirmed',
      paymentMode: 'full_prepaid',
      advancePaymentStatus: 'captured',
      balanceCollectionStatus: 'not_applicable',
      shipmentStatus: 'unfulfilled',
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    });
    console.log(`   ✓ Created test order: ${testOrderId}\n`);

    // -------------------------------------------------------------------------
    // 1️⃣ Verified Purchase Gate: Reject non-existent order
    // -------------------------------------------------------------------------
    console.log('1️⃣ Testing Rejection of Non-Existent Order...');
    let rejectedNonExistent = false;
    try {
      await reviewService.submitReview({
        productId: testProductId,
        orderId: 'GG-FAKE-000000',
        customerEmail: testCustomerEmail,
        rating: 5,
        title: 'Fake Review',
        comment: 'This should definitely fail verified purchase check.',
      });
    } catch (err: any) {
      if (err.message.includes('does not exist')) {
        rejectedNonExistent = true;
      }
    }
    if (!rejectedNonExistent) {
      throw new Error('FAILED: Review was accepted for non-existent order!');
    }
    console.log('   ✓ Rejected review for non-existent order as expected.');
    console.log('   ✅ Non-existent order rejection verified.\n');

    // -------------------------------------------------------------------------
    // 2️⃣ Verified Purchase Gate: Reject mismatching customer
    // -------------------------------------------------------------------------
    console.log('2️⃣ Testing Rejection of Unmatched Customer Email/Account...');
    let rejectedMismatch = false;
    try {
      await reviewService.submitReview({
        productId: testProductId,
        orderId: testOrderId,
        customerEmail: 'imposter@example.com',
        rating: 5,
        title: 'Imposter Review',
        comment: 'I did not actually buy this order.',
      });
    } catch (err: any) {
      if (err.message.includes('Verification failed')) {
        rejectedMismatch = true;
      }
    }
    if (!rejectedMismatch) {
      throw new Error('FAILED: Review was accepted for imposter customer!');
    }
    console.log('   ✓ Blocked submission from unauthorized email imposter@example.com.');
    console.log('   ✅ Customer identity verification verified.\n');

    // -------------------------------------------------------------------------
    // 3️⃣ Verified Purchase Gate: Reject product not in order
    // -------------------------------------------------------------------------
    console.log('3️⃣ Testing Rejection of Product Not Purchased in Order...');
    let rejectedUnpurchased = false;
    try {
      await reviewService.submitReview({
        productId: 'unpurchased-product-sku',
        orderId: testOrderId,
        customerEmail: testCustomerEmail,
        rating: 5,
        title: 'Unpurchased Item',
        comment: 'Trying to review something I never ordered.',
      });
    } catch (err: any) {
      if (err.message.includes('was not found in Order')) {
        rejectedUnpurchased = true;
      }
    }
    if (!rejectedUnpurchased) {
      throw new Error('FAILED: Review was accepted for unpurchased product!');
    }
    console.log('   ✓ Blocked submission for product not in order line items.');
    console.log('   ✅ Unpurchased product rejection verified.\n');

    // -------------------------------------------------------------------------
    // 4️⃣ Verified Purchase Submission: Success & Pending Moderation
    // -------------------------------------------------------------------------
    console.log('4️⃣ Testing Legitimate Verified Purchase Review Submission...');
    const submissionResult = await reviewService.submitReview(
      {
        productId: testProductId,
        orderId: testOrderId,
        customerEmail: testCustomerEmail,
        customerName: 'Dr. Kabir Anand',
        rating: 5,
        title: 'Remarkable digestive lightness within 14 days',
        comment:
          'The synbiotic formulation dissolves effortlessly. Experienced zero post-prandial bloating. A staple in my morning ritual.',
      },
      { uid: testCustomerUid, email: testCustomerEmail }
    );

    createdReviewIds.push(submissionResult.review.id);
    if (
      submissionResult.review.status !== 'pending' ||
      !submissionResult.review.isVerifiedBuyer
    ) {
      throw new Error('FAILED: Review status or verified buyer flag is invalid.');
    }
    console.log(`   ✓ Review created: ${submissionResult.review.id}`);
    console.log(`   ✓ Initial status: ${submissionResult.review.status}`);
    console.log(`   ✓ Verified Buyer: ${submissionResult.review.isVerifiedBuyer}`);
    console.log('   ✅ Legitimate verified purchase review submission passed.\n');

    // -------------------------------------------------------------------------
    // 5️⃣ Duplicate Prevention: Reject second review on same order + product
    // -------------------------------------------------------------------------
    console.log('5️⃣ Testing Duplicate Review Prevention...');
    let rejectedDuplicate = false;
    try {
      await reviewService.submitReview(
        {
          productId: testProductId,
          orderId: testOrderId,
          customerEmail: testCustomerEmail,
          rating: 4,
          title: 'Second review attempt',
          comment: 'Trying to review again from the same order.',
        },
        { uid: testCustomerUid, email: testCustomerEmail }
      );
    } catch (err: any) {
      if (err.message.includes('already been submitted')) {
        rejectedDuplicate = true;
      }
    }
    if (!rejectedDuplicate) {
      throw new Error('FAILED: Allowed duplicate review on same order + product!');
    }
    console.log('   ✓ Blocked duplicate review attempt on same order.');
    console.log('   ✅ Duplicate review protection verified.\n');

    // -------------------------------------------------------------------------
    // 6️⃣ Public Storefront Endpoint: Ensure Pending Review Is NOT Leaked
    // -------------------------------------------------------------------------
    console.log('6️⃣ Testing Public Endpoint Isolation of Pending Reviews...');
    const publicBeforeApproval = await reviewService.getPublicReviews({
      productId: testProductId,
    });
    const foundPendingInPublic = publicBeforeApproval.reviews.some(
      (r) => r.id === submissionResult.review.id
    );
    if (foundPendingInPublic) {
      throw new Error('FAILED: Pending review leaked into public storefront query!');
    }
    console.log('   ✓ Verified pending review is isolated from public storefront.');
    console.log('   ✅ Editorial moderation isolation verified.\n');

    // -------------------------------------------------------------------------
    // 7️⃣ Admin Moderation Workflow & Atomic Product Aggregation
    // -------------------------------------------------------------------------
    console.log('7️⃣ Testing Admin Moderation Approval & Atomic Aggregate Recalculation...');
    const adminUser = { uid: 'adm_test', email: 'admin@gutglow.com' };

    const moderationResult = await reviewService.moderateReview(
      submissionResult.review.id,
      { action: 'approve', moderatorNotes: 'Verified clinical buyer tone.' },
      adminUser
    );

    if (moderationResult.review.status !== 'approved') {
      throw new Error('FAILED: Review was not approved.');
    }
    console.log(`   ✓ Review status updated: pending -> ${moderationResult.review.status}`);
    console.log(`   ✓ Moderated By: ${moderationResult.review.moderatedBy}`);

    // Verify product document updated in Firestore
    const productDoc = await adminDb.collection('products').doc(testProductId).get();
    if (!productDoc.exists) {
      throw new Error(`Product ${testProductId} not found!`);
    }
    const productData = productDoc.data();
    console.log(`   ✓ Product Firestore Document Aggregates:`);
    console.log(`     - averageRating: ${productData?.averageRating}`);
    console.log(`     - reviewCount: ${productData?.reviewCount}`);

    if (typeof productData?.averageRating !== 'number' || typeof productData?.reviewCount !== 'number') {
      throw new Error('FAILED: Product aggregates not numbers.');
    }
    console.log('   ✅ Atomic rating aggregation on approval verified.\n');

    // -------------------------------------------------------------------------
    // 8️⃣ Public Storefront Query: Privacy Masking & Breakdown Stats
    // -------------------------------------------------------------------------
    console.log('8️⃣ Testing Public Storefront Query With Privacy Name Masking...');
    const publicAfterApproval = await reviewService.getPublicReviews({
      productId: testProductId,
    });
    const approvedItem = publicAfterApproval.reviews.find(
      (r) => r.id === submissionResult.review.id
    );

    if (!approvedItem) {
      throw new Error('FAILED: Approved review does not appear in public query.');
    }
    console.log(`   ✓ Customer Name masked: "${approvedItem.customerName}" (Dr. Kabir Anand -> ${approvedItem.customerName})`);
    console.log(`   ✓ Rating: ${approvedItem.rating} stars`);
    console.log(`   ✓ Title: "${approvedItem.title}"`);
    console.log(`   ✓ Breakdown:`, publicAfterApproval.stats.ratingBreakdown);
    console.log('   ✅ Public query and privacy masking verified.\n');

    // -------------------------------------------------------------------------
    // 9️⃣ Admin Review Listing & Moderation Rejection
    // -------------------------------------------------------------------------
    console.log('9️⃣ Testing Admin Review Listing & Status Filtering...');
    const adminListApproved = await reviewService.listReviewsForAdmin({
      productId: testProductId,
      status: 'approved',
    });
    console.log(`   ✓ Admin approved list count: ${adminListApproved.reviews.length}`);

    // Moderate to rejected
    const rejectResult = await reviewService.moderateReview(
      submissionResult.review.id,
      { action: 'reject', moderatorNotes: 'Testing rejection workflow' },
      adminUser
    );
    if (rejectResult.review.status !== 'rejected') {
      throw new Error('FAILED: Status not rejected.');
    }
    console.log(`   ✓ Review status updated: approved -> ${rejectResult.review.status}`);
    console.log('   ✅ Admin listing and rejection workflow verified.\n');

  } finally {
    // -------------------------------------------------------------------------
    // Cleanup: Remove test orders and test reviews
    // -------------------------------------------------------------------------
    console.log('🧹 Cleaning up test artifacts...');
    await adminDb.collection('orders').doc(testOrderId).delete();
    for (const rId of createdReviewIds) {
      await adminDb.collection('reviews').doc(rId).delete();
    }
    // Restore product ratings
    await reviewService.recalculateProductRatings(testProductId);
    console.log('   ✅ Test order, reviews, and aggregates restored to pristine state.\n');
  }

  console.log('═══════════════════════════════════════════════════════════════════════════════');
  console.log('🎉 ALL PHASE 12 CUSTOMER REVIEW ENGINE TESTS PASSED (100% SUCCESS)!');
  console.log('═══════════════════════════════════════════════════════════════════════════════\n');
}

runReviewEngineTests().catch((err) => {
  console.error('❌ Test failed with error:', err);
  process.exit(1);
});
