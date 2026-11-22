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

async function runCustomerTests() {
  console.log('🧪 Starting Phase 08: Customer Management & Address Book Backend Tests...\n');

  const { customerService } = await import('@/lib/services/customerService');
  const { adminDb } = await import('@/lib/firebase/admin');

  const testUid = `test-user-${Date.now()}`;
  const testEmail = `test.user.${Date.now()}@example.com`;

  try {
    // ----------------------------------------------------
    // TEST 1: User Auto-Provisioning
    // ----------------------------------------------------
    console.log('1️⃣ Testing Customer Auto-Provisioning Hook...');
    const provisionedUser = await customerService.ensureCustomerUserDoc(
      testUid,
      testEmail,
      'Imran Test Ahmad',
      '9876543210'
    );

    if (provisionedUser.uid !== testUid || provisionedUser.firstName !== 'Imran') {
      throw new Error(`Auto-provisioning mismatch: ${JSON.stringify(provisionedUser)}`);
    }
    console.log(`   ✅ User auto-provisioned successfully: ${provisionedUser.email} (${provisionedUser.firstName} ${provisionedUser.lastName})`);

    // ----------------------------------------------------
    // TEST 2: Customer Profile Retrieval & Updating
    // ----------------------------------------------------
    console.log('\n2️⃣ Testing Customer Profile Retrieval & Updating...');
    const profileBefore = await customerService.getCustomerProfile(testUid);
    if (!profileBefore || profileBefore.user.email !== testEmail) {
      throw new Error('Failed to retrieve customer profile');
    }

    await customerService.updateCustomerProfile(testUid, {
      firstName: 'ImranUpdated',
      lastName: 'AhmadUpdated',
      phone: '9123456789',
    });

    const profileAfter = await customerService.getCustomerProfile(testUid);
    if (profileAfter?.user.firstName !== 'ImranUpdated' || profileAfter?.user.phone !== '9123456789') {
      throw new Error('Profile update verification failed');
    }
    console.log('   ✅ Profile updated and verified in Firestore.');

    // ----------------------------------------------------
    // TEST 3: Validation Constraints (PIN, GST State Code, Phone)
    // ----------------------------------------------------
    console.log('\n3️⃣ Testing Indian Address Validation Constraints (PIN, GST, Phone)...');

    // Invalid PIN
    let caughtInvalidPin = false;
    try {
      await customerService.addAddress(testUid, {
        fullName: 'Test User',
        phone: '9876543210',
        addressLine1: '123 Marine Drive',
        city: 'Mumbai',
        state: 'Maharashtra',
        stateCode: '27',
        pincode: '400', // Invalid PIN
        isDefaultShipping: true,
      });
    } catch {
      caughtInvalidPin = true;
    }
    if (!caughtInvalidPin) throw new Error('Failed to reject invalid PIN code');
    console.log('   ✅ Rejected invalid PIN code ("400") correctly.');

    // Invalid GST State Code
    let caughtInvalidGst = false;
    try {
      await customerService.addAddress(testUid, {
        fullName: 'Test User',
        phone: '9876543210',
        addressLine1: '123 Marine Drive',
        city: 'Mumbai',
        state: 'Invalid State',
        stateCode: '99', // Invalid GST state code
        pincode: '400050',
        isDefaultShipping: true,
      });
    } catch {
      caughtInvalidGst = true;
    }
    if (!caughtInvalidGst) throw new Error('Failed to reject invalid GST state code');
    console.log('   ✅ Rejected invalid GST state code ("99") correctly.');

    // ----------------------------------------------------
    // TEST 4: Multi-Address Management & Default Switch
    // ----------------------------------------------------
    console.log('\n4️⃣ Testing Multi-Address Management & Default Shipping Switch...');
    
    // Add Address 1 (Default)
    const addr1 = await customerService.addAddress(testUid, {
      fullName: 'Imran Ahmad',
      phone: '9876543210',
      addressLine1: 'Flat 402, Sea Green Apartments',
      addressLine2: 'Perry Cross Road',
      city: 'Mumbai',
      state: 'Maharashtra',
      stateCode: '27',
      pincode: '400050',
      isDefaultShipping: true,
      isDefaultBilling: true,
    });
    console.log(`   ✅ Address 1 added (id: ${addr1.id}) with isDefaultShipping: true`);

    // Add Address 2 (New Default) -> Must auto-unset Address 1 default
    const addr2 = await customerService.addAddress(testUid, {
      fullName: 'Imran Ahmad Office',
      phone: '9876543210',
      addressLine1: 'Level 5, Platina, BKC',
      city: 'Mumbai',
      state: 'Maharashtra',
      stateCode: '27',
      pincode: '400051',
      isDefaultShipping: true,
      isDefaultBilling: false,
    });
    console.log(`   ✅ Address 2 added (id: ${addr2.id}) with isDefaultShipping: true`);

    // Verify Address 1 was unset
    const addresses = await customerService.listAddresses(testUid);
    const refreshedAddr1 = addresses.find((a) => a.id === addr1.id);
    const refreshedAddr2 = addresses.find((a) => a.id === addr2.id);

    if (refreshedAddr1?.isDefaultShipping !== false) {
      throw new Error('Address 1 default shipping was not unset when Address 2 became default');
    }
    if (refreshedAddr2?.isDefaultShipping !== true) {
      throw new Error('Address 2 is not set as default shipping');
    }
    console.log('   ✅ Default shipping cleanly switched: Address 2 is default, Address 1 unset.');

    // ----------------------------------------------------
    // TEST 5: Internal Customer Support Notes Subcollection
    // ----------------------------------------------------
    console.log('\n5️⃣ Testing Internal Customer Support Notes Subcollection...');
    const note = await customerService.addSupportNote(
      testUid,
      {
        id: 'admin-super-1',
        name: 'Super Admin',
        email: 'admin@gutglow.com',
      },
      {
        note: 'Customer requested delayed shipment delivery for morning batch. Verified VIP member.',
      }
    );
    console.log(`   ✅ Support note created (id: ${note.id})`);

    const notesList = await customerService.listSupportNotes(testUid);
    if (notesList.length === 0 || notesList[0].note !== note.note) {
      throw new Error('Failed to retrieve customer support notes');
    }
    console.log(`   ✅ Retrieved ${notesList.length} internal support note(s) for customer.`);

    // ----------------------------------------------------
    // TEST 6: Admin Customer CRM View & Search
    // ----------------------------------------------------
    console.log('\n6️⃣ Testing Admin Customer CRM Directory & Detail Aggregator...');
    const searchResults = await customerService.listCustomersForAdmin('ImranUpdated');
    const found = searchResults.some((c) => c.uid === testUid);
    if (!found) {
      throw new Error('Customer search did not return newly updated customer');
    }
    console.log(`   ✅ Customer search found updated customer in admin directory.`);

    const adminDetail = await customerService.getCustomerDetailForAdmin(testUid);
    if (!adminDetail || adminDetail.addresses.length !== 2 || adminDetail.supportNotes.length !== 1) {
      throw new Error(`Admin customer detail mismatch: ${JSON.stringify(adminDetail)}`);
    }
    console.log(`   ✅ Admin customer detail aggregated: ${adminDetail.addresses.length} addresses, ${adminDetail.supportNotes.length} notes.`);

    // ----------------------------------------------------
    // CLEANUP
    // ----------------------------------------------------
    console.log('\n🧹 Cleaning up test customer data from Firestore...');
    await customerService.deleteAddress(testUid, addr1.id);
    await customerService.deleteAddress(testUid, addr2.id);
    const notesSnap = await adminDb.collection('users').doc(testUid).collection('supportNotes').get();
    for (const d of notesSnap.docs) {
      await d.ref.delete();
    }
    await adminDb.collection('users').doc(testUid).delete();
    console.log('   ✅ Test customer cleanup completed.');

    console.log('\n🎉 ALL PHASE 08 CUSTOMER SERVICE TESTS PASSED (100% SUCCESS)!\n');
  } catch (error) {
    console.error('\n❌ Test execution failed:', error);
    process.exit(1);
  }
}

runCustomerTests();
