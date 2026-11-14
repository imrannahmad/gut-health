/**
 * Admin Claims Bootstrap Script
 * Assigns super_admin custom claim and creates admin document in Firestore.
 * Usage: npx tsx scripts/assign-admin-claim.ts [email] [name]
 */
import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';
import * as fs from 'fs';
import * as path from 'path';

// Parse .env.local manually if not loaded
function loadEnvLocal() {
  const envPath = path.resolve(process.cwd(), '.env.local');
  if (fs.existsSync(envPath)) {
    const lines = fs.readFileSync(envPath, 'utf8').split('\n');
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;
      const eqIdx = trimmed.indexOf('=');
      if (eqIdx !== -1) {
        const key = trimmed.slice(0, eqIdx).trim();
        let val = trimmed.slice(eqIdx + 1).trim();
        if (val.startsWith('"') && val.endsWith('"')) {
          val = val.slice(1, -1);
        }
        if (!process.env[key]) {
          process.env[key] = val;
        }
      }
    }
  }
}

loadEnvLocal();

const projectId = process.env.FIREBASE_ADMIN_PROJECT_ID;
const clientEmail = process.env.FIREBASE_ADMIN_CLIENT_EMAIL;
const privateKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, '\n');

if (!projectId || !clientEmail || !privateKey) {
  console.error('❌ Missing Firebase Admin credentials in .env.local');
  process.exit(1);
}

const app =
  getApps().length > 0
    ? getApps()[0]
    : initializeApp({
        projectId,
        credential: cert({
          projectId,
          clientEmail,
          privateKey,
        }),
      });

const auth = getAuth(app);
const db = getFirestore(app);

async function bootstrapAdmin() {
  const targetEmail = process.argv[2] || 'imrannahmd@gmail.com';
  const targetName = process.argv[3] || 'Owner Admin';

  console.log(`🔐 Bootstrapping Super Admin for email: ${targetEmail}...`);

  let userRecord;
  try {
    userRecord = await auth.getUserByEmail(targetEmail);
    console.log(`  ✓ Found existing Firebase Auth user: ${userRecord.uid}`);
  } catch (err: unknown) {
    const error = err as { code?: string };
    if (error.code === 'auth/user-not-found') {
      console.log(`  ℹ User not found in Firebase Auth. Creating user record...`);
      userRecord = await auth.createUser({
        email: targetEmail,
        displayName: targetName,
        emailVerified: true,
      });
      console.log(`  ✓ Created new Firebase Auth user: ${userRecord.uid}`);
    } else {
      throw err;
    }
  }

  // 1. Set Custom User Claims on Firebase Auth
  await auth.setCustomUserClaims(userRecord.uid, {
    role: 'super_admin',
  });
  console.log(`  ✓ Custom claim { role: 'super_admin' } assigned to Firebase Auth token`);

  // 2. Persist in Firestore 'admins' collection
  const adminDocRef = db.collection('admins').doc(userRecord.uid);
  await adminDocRef.set(
    {
      uid: userRecord.uid,
      email: targetEmail,
      name: targetName,
      role: 'super_admin',
      isActive: true,
      updatedAt: FieldValue.serverTimestamp(),
      createdAt: FieldValue.serverTimestamp(),
    },
    { merge: true }
  );
  console.log(`  ✓ Admin record saved to Firestore collection 'admins/${userRecord.uid}'`);

  console.log(`\n🎉 Super Admin bootstrap successfully completed for ${targetEmail}!`);
  process.exit(0);
}

bootstrapAdmin().catch((error) => {
  console.error('❌ Bootstrap failed:', error);
  process.exit(1);
});
