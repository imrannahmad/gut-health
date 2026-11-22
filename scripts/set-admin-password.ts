/**
 * Set Admin Password & Super Admin Claims
 * Sets password '@GutGlow4x' for imrannahmd@gmail.com and admin@gutglow.com
 */

import fs from 'fs';
import path from 'path';
import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';

const envPath = path.resolve(process.cwd(), '.env.local');
const envContent = fs.readFileSync(envPath, 'utf-8');
const env: Record<string, string> = {};
envContent.split('\n').forEach((line) => {
  const match = line.match(/^([^=]+)=(.*)$/);
  if (match) {
    let val = match[2].trim();
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
      val = val.slice(1, -1);
    }
    env[match[1].trim()] = val.replace(/\\n/g, '\n');
  }
});

const app = getApps().length > 0 ? getApps()[0] : initializeApp({
  projectId: env.FIREBASE_ADMIN_PROJECT_ID,
  credential: cert({
    projectId: env.FIREBASE_ADMIN_PROJECT_ID,
    clientEmail: env.FIREBASE_ADMIN_CLIENT_EMAIL,
    privateKey: env.FIREBASE_ADMIN_PRIVATE_KEY,
  }),
});

const auth = getAuth(app);
const db = getFirestore(app);

async function setupAdminAccount(email: string, password: string, name: string) {
  console.log(`\n🔐 Configuring Admin: ${email}...`);
  let userRecord;
  try {
    userRecord = await auth.getUserByEmail(email);
    console.log(`  ✓ Found user: ${userRecord.uid}`);
    userRecord = await auth.updateUser(userRecord.uid, {
      password,
      emailVerified: true,
      displayName: name,
    });
    console.log(`  ✓ Updated password to '${password}' and verified email`);
  } catch (err: any) {
    if (err.code === 'auth/user-not-found') {
      console.log(`  ℹ User not found. Creating new user...`);
      userRecord = await auth.createUser({
        email,
        password,
        emailVerified: true,
        displayName: name,
      });
      console.log(`  ✓ Created user: ${userRecord.uid} with password '${password}'`);
    } else {
      throw err;
    }
  }

  // Assign Super Admin custom claims
  await auth.setCustomUserClaims(userRecord.uid, {
    role: 'super_admin',
  });
  console.log(`  ✓ Set custom claims: { role: 'super_admin' }`);

  // Persist in 'admins' collection
  await db.collection('admins').doc(userRecord.uid).set(
    {
      uid: userRecord.uid,
      email,
      name,
      role: 'super_admin',
      isActive: true,
      updatedAt: FieldValue.serverTimestamp(),
      createdAt: FieldValue.serverTimestamp(),
    },
    { merge: true }
  );
  console.log(`  ✓ Persisted to Firestore 'admins/${userRecord.uid}'`);
}

async function main() {
  const newPassword = process.argv[2] || '@GutGlow4x';
  console.log('═══════════════════════════════════════════════════════════════════════════════');
  console.log('🛡️  GUTGLOW ADMIN PASSWORD SETUP');
  console.log('═══════════════════════════════════════════════════════════════════════════════');

  // Configure imrannahmd@gmail.com
  await setupAdminAccount('imrannahmd@gmail.com', newPassword, 'Imran Ahmad (Owner)');

  // Configure admin@gutglow.com as secondary alias
  await setupAdminAccount('admin@gutglow.com', newPassword, 'GutGlow System Admin');

  console.log('\n═══════════════════════════════════════════════════════════════════════════════');
  console.log('🎉 ADMIN CREDENTIALS READY FOR LOGIN:');
  console.log('   Email 1: imrannahmd@gmail.com');
  console.log('   Email 2: admin@gutglow.com');
  console.log(`   Password: ${newPassword}`);
  console.log('═══════════════════════════════════════════════════════════════════════════════');
}

main().catch(console.error);
