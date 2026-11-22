/**
 * GutGlow Category Seeding Script
 * Seeds primary categories ('Gut Wellness Nutraceuticals', 'Daily Rituals & Accessories')
 * into Cloud Firestore.
 */

import fs from 'fs';
import path from 'path';
import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';

// Parse .env.local
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

const projectId = env.FIREBASE_ADMIN_PROJECT_ID || env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'gutglow-development';
const clientEmail = env.FIREBASE_ADMIN_CLIENT_EMAIL;
const privateKey = env.FIREBASE_ADMIN_PRIVATE_KEY;

if (!clientEmail || !privateKey) {
  console.error('❌ Missing Firebase Admin credentials in .env.local');
  process.exit(1);
}

const adminApp = getApps().length > 0 ? getApps()[0] : initializeApp({
  projectId,
  credential: cert({
    projectId,
    clientEmail,
    privateKey,
  }),
});

const db = getFirestore(adminApp);

async function seedCategories() {
  console.log('═══════════════════════════════════════════════════════════════════════════════');
  console.log('📂  GUTGLOW CATEGORY MASTER SEEDING');
  console.log(`🎯  Target Project: ${projectId}`);
  console.log('═══════════════════════════════════════════════════════════════════════════════\n');

  const categories = [
    {
      id: 'gut-wellness',
      name: 'Gut Wellness Nutraceuticals',
      slug: 'gut-wellness',
      description: 'Science-backed daily rituals supporting digestive balance, healthy gut barrier, and nutrient absorption.',
      displayOrder: 1,
      isActive: true,
      productCount: 1,
    },
    {
      id: 'daily-rituals',
      name: 'Daily Rituals & Accessories',
      slug: 'daily-rituals',
      description: 'Mindful morning routines, dosing tools, and companion digestive wellness lifestyle essentials.',
      displayOrder: 2,
      isActive: true,
      productCount: 0,
    },
  ];

  for (const cat of categories) {
    console.log(`👉 Seeding category: "${cat.name}" (${cat.id})...`);
    await db.collection('categories').doc(cat.id).set(
      {
        ...cat,
        createdAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp(),
      },
      { merge: true }
    );
    console.log(`   ✅ Seeded successfully: categories/${cat.id}`);
  }

  console.log('\n═══════════════════════════════════════════════════════════════════════════════');
  console.log('🎉  ALL CATEGORIES SEEDED SUCCESSFULLY!');
  console.log('═══════════════════════════════════════════════════════════════════════════════');
}

seedCategories().catch((err) => {
  console.error('❌ Seeding failed:', err);
  process.exit(1);
});
