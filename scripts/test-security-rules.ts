/**
 * GutGlow Security Rules Test Suite
 * Asserts Deny-by-Default security posture against active Firestore Security Rules.
 * Verifies that client SDK (unauthenticated / unprivileged) cannot perform unauthorized operations.
 */

import { initializeApp, getApps, deleteApp } from 'firebase/app';
import {
  getFirestore,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  collection,
  getDocs,
} from 'firebase/firestore';
import fs from 'fs';
import path from 'path';

function loadClientConfig() {
  const envPath = path.resolve(process.cwd(), '.env.local');
  const envContent = fs.readFileSync(envPath, 'utf-8');
  const env: Record<string, string> = {};

  envContent.split('\n').forEach((line) => {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) return;
    const match = trimmed.match(/^([^=]+)=(.*)$/);
    if (match) {
      let val = match[2].trim();
      if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
        val = val.slice(1, -1);
      }
      env[match[1].trim()] = val.replace(/\\n/g, '\n');
    }
  });

  return {
    apiKey: env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: env.NEXT_PUBLIC_FIREBASE_APP_ID,
  };
}

interface TestResult {
  testName: string;
  expectedResult: 'DENIED' | 'ALLOWED';
  actualResult: 'DENIED' | 'ALLOWED' | 'ERROR';
  passed: boolean;
  details?: string;
}

const results: TestResult[] = [];

function recordResult(name: string, expected: 'DENIED' | 'ALLOWED', error: unknown) {
  const isPermissionDenied =
    error instanceof Error &&
    (error.message.includes('permission-denied') ||
     error.message.includes('Missing or insufficient permissions') ||
     (error as { code?: string }).code === 'permission-denied');

  const actual = isPermissionDenied ? 'DENIED' : error ? 'ERROR' : 'ALLOWED';
  const passed = expected === actual;

  results.push({
    testName: name,
    expectedResult: expected,
    actualResult: actual,
    passed,
    details: error instanceof Error ? error.message : undefined,
  });

  const icon = passed ? '✅ PASS' : '❌ FAIL';
  console.log(`${icon} | ${name.padEnd(55)} | Expected: ${expected} | Actual: ${actual}`);
}

async function runTestSuite() {
  console.log('═══════════════════════════════════════════════════════════════════════════════');
  console.log('🛡️  GUTGLOW LIVE SECURITY RULES VERIFICATION TEST SUITE');
  console.log('═══════════════════════════════════════════════════════════════════════════════\n');

  const config = loadClientConfig();
  const testApp = initializeApp(config, 'security-rules-test-runner');
  const db = getFirestore(testApp);

  try {
    // 1. ORDERS COLLECTION TESTS
    console.log('📦 [Category 1: Orders - Deny Direct Client Writes]');
    try {
      await setDoc(doc(db, 'orders', 'unauthorized_order_attempt'), {
        orderNumber: 'GG-HACK-001',
        totalAmountInPaise: 100, // Attempting illegal order write
        customerId: 'attacker_uid',
      });
      recordResult('1.1 Unauthenticated write to /orders/orderId', 'DENIED', null);
    } catch (err) {
      recordResult('1.1 Unauthenticated write to /orders/orderId', 'DENIED', err);
    }

    try {
      await getDoc(doc(db, 'orders', 'unauthorized_order_attempt'));
      recordResult('1.2 Unauthenticated read from /orders/orderId', 'DENIED', null);
    } catch (err) {
      recordResult('1.2 Unauthenticated read from /orders/orderId', 'DENIED', err);
    }

    // 2. INVENTORY & BATCHES TESTS
    console.log('\n🏭 [Category 2: Inventory & Batches - Strict Server-Only]');
    try {
      await setDoc(doc(db, 'inventory', 'GG-DWF-200G'), {
        quantityAvailable: 99999,
      });
      recordResult('2.1 Unauthenticated write to /inventory/sku', 'DENIED', null);
    } catch (err) {
      recordResult('2.1 Unauthenticated write to /inventory/sku', 'DENIED', err);
    }

    try {
      await getDoc(doc(db, 'inventory', 'GG-DWF-200G'));
      recordResult('2.2 Unauthenticated read from /inventory/sku', 'DENIED', null);
    } catch (err) {
      recordResult('2.2 Unauthenticated read from /inventory/sku', 'DENIED', err);
    }

    try {
      await setDoc(doc(db, 'inventory', 'GG-DWF-200G', 'batches', 'BATCH-001'), {
        quantityAvailable: 500,
      });
      recordResult('2.3 Unauthenticated write to /inventory/sku/batches', 'DENIED', null);
    } catch (err) {
      recordResult('2.3 Unauthenticated write to /inventory/sku/batches', 'DENIED', err);
    }

    // 3. COUPONS COLLECTION TESTS
    console.log('\n🎟️  [Category 3: Promotional Coupons - Prevent Scraping]');
    try {
      await setDoc(doc(db, 'coupons', 'HACK50'), {
        discountType: 'percentage',
        discountValue: 50,
      });
      recordResult('3.1 Unauthenticated write to /coupons/code', 'DENIED', null);
    } catch (err) {
      recordResult('3.1 Unauthenticated write to /coupons/code', 'DENIED', err);
    }

    try {
      await getDoc(doc(db, 'coupons', 'HACK50'));
      recordResult('3.2 Unauthenticated read from /coupons/code', 'DENIED', null);
    } catch (err) {
      recordResult('3.2 Unauthenticated read from /coupons/code', 'DENIED', err);
    }

    // 4. ADMIN AUDIT LOGS TESTS
    console.log('\n📜 [Category 4: Immutable Admin Audit Logs - Tamper-Proof]');
    try {
      await setDoc(doc(db, 'adminLogs', 'fake_admin_log'), {
        action: 'order.override',
        performedBy: 'malicious_client',
      });
      recordResult('4.1 Unauthenticated write to /adminLogs/logId', 'DENIED', null);
    } catch (err) {
      recordResult('4.1 Unauthenticated write to /adminLogs/logId', 'DENIED', err);
    }

    try {
      await getDoc(doc(db, 'adminLogs', 'fake_admin_log'));
      recordResult('4.2 Unauthenticated read from /adminLogs/logId', 'DENIED', null);
    } catch (err) {
      recordResult('4.2 Unauthenticated read from /adminLogs/logId', 'DENIED', err);
    }

    // 5. PRODUCTS WRITE PROTECTION
    console.log('\n🛍️  [Category 5: Product Catalog - Client Write Protection]');
    try {
      await setDoc(doc(db, 'products', 'malicious_product'), {
        title: 'Free Item',
        pricing: { basePriceInPaise: 0 },
      });
      recordResult('5.1 Unauthenticated write to /products/productId', 'DENIED', null);
    } catch (err) {
      recordResult('5.1 Unauthenticated write to /products/productId', 'DENIED', err);
    }

    // 6. USERS PROFILE PROTECTION
    console.log('\n👤 [Category 6: User Profiles - Identity Spoofing Protection]');
    try {
      await setDoc(doc(db, 'users', 'victim_uid'), {
        role: 'super_admin',
        totalSpendInPaise: 10000000,
      });
      recordResult('6.1 Unauthenticated write to /users/victimId', 'DENIED', null);
    } catch (err) {
      recordResult('6.1 Unauthenticated write to /users/victimId', 'DENIED', err);
    }

    // 7. PUBLIC SETTINGS READ
    console.log('\n⚙️  [Category 7: Store Settings - Public Read Allowed, Write Denied]');
    try {
      await getDoc(doc(db, 'settings', 'store_config'));
      recordResult('7.1 Unauthenticated read from /settings/store_config', 'ALLOWED', null);
    } catch (err) {
      recordResult('7.1 Unauthenticated read from /settings/store_config', 'ALLOWED', err);
    }

    try {
      await setDoc(doc(db, 'settings', 'store_config'), {
        maintenanceMode: true,
      });
      recordResult('7.2 Unauthenticated write to /settings/store_config', 'DENIED', null);
    } catch (err) {
      recordResult('7.2 Unauthenticated write to /settings/store_config', 'DENIED', err);
    }

    // SUMMARY
    console.log('\n═══════════════════════════════════════════════════════════════════════════════');
    const passedCount = results.filter((r) => r.passed).length;
    const totalCount = results.length;
    console.log(`📊 TEST SUMMARY: ${passedCount}/${totalCount} Assertions Passed (${Math.round((passedCount/totalCount)*100)}%)`);
    console.log('═══════════════════════════════════════════════════════════════════════════════');

    if (passedCount !== totalCount) {
      process.exit(1);
    }
  } finally {
    await deleteApp(testApp);
  }
}

runTestSuite().catch((err) => {
  console.error('Fatal Test Suite Error:', err);
  process.exit(1);
});
