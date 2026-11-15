/**
 * GutGlow Master Seeding Script
 * Seeds flagship formula, initial warehouse inventory batch (GG-DWF-200G),
 * category, and store configuration in integer paise directly into Cloud Firestore.
 */

import fs from 'fs';
import path from 'path';
import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getFirestore, FieldValue, Timestamp } from 'firebase-admin/firestore';

// 1. Parse .env.local
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

async function seedMasterData() {
  console.log('═══════════════════════════════════════════════════════════════════════════════');
  console.log('🌱  GUTGLOW MASTER PRODUCT & INVENTORY SEEDING');
  console.log(`🎯  Target Project: ${projectId}`);
  console.log('═══════════════════════════════════════════════════════════════════════════════\n');

  // 1. SEED CATEGORY
  console.log('1️⃣  Seeding Primary Category: "Gut Wellness Nutraceuticals"...');
  await db.collection('categories').doc('gut-wellness').set({
    name: 'Gut Wellness Nutraceuticals',
    slug: 'gut-wellness',
    description: 'Science-backed daily rituals supporting digestive balance, healthy gut barrier, and nutrient absorption.',
    isActive: true,
    displayOrder: 1,
    createdAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
  });
  console.log('   ✅ Category seeded: categories/gut-wellness');

  // 2. SEED FLAGSHIP PRODUCT (Integer Paise Standard)
  console.log('\n2️⃣  Seeding Flagship Product: "GutGlow Daily Wellness Formula"...');
  const productId = 'gutglow-daily-wellness';
  await db.collection('products').doc(productId).set({
    id: productId,
    slug: 'gutglow-daily-wellness',
    name: 'GutGlow Daily Wellness Formula',
    tagline: 'Thoughtful gut wellness for everyday living.',
    shortDescription:
      'A clean, daily approach to digestive wellness. Formulated with targeted botanicals and prebiotic fiber to support everyday gut balance.',
    fullDescription:
      'GutGlow Daily Wellness Formula is designed to integrate effortlessly into your morning routine. A focused, non-laxative blend supporting healthy gut flora, natural digestive ease, and nutrient absorption.',
    category: {
      id: 'gut-wellness',
      name: 'Gut Wellness Nutraceuticals',
      slug: 'gut-wellness',
    },
    status: 'active',
    isFeatured: true,
    servingSize: '1 Scoop (~6.5g) daily with water',
    baseSku: 'GG-DWF-200G',
    netWeightGrams: 200,
    hsnCode: '2106 90 99',
    gstRateBasisPoints: 1800, // 18.00% GST
    packOptions: [
      {
        id: 'pack-1-month',
        name: '1-Month Supply',
        subtitle: '30 Daily Servings',
        packQuantity: 1,
        servings: 30,
        durationMonths: 1,
        totalWeightGrams: 200,
        sellingPriceInPaise: 199900, // ₹1,999.00
        mrpInPaise: 249900,          // ₹2,499.00
        compareAtPriceInPaise: 249900,
        badge: 'Standard',
        isPopular: false,
        isActive: true,
      },
      {
        id: 'pack-2-month',
        name: '2-Month Supply',
        subtitle: '60 Daily Servings',
        packQuantity: 2,
        servings: 60,
        durationMonths: 2,
        totalWeightGrams: 400,
        sellingPriceInPaise: 359900, // ₹3,599.00
        mrpInPaise: 499900,          // ₹4,999.00
        compareAtPriceInPaise: 499900,
        badge: 'Save 28%',
        isPopular: false,
        isActive: true,
      },
      {
        id: 'pack-3-month',
        name: '3-Month Ritual',
        subtitle: '90 Daily Servings',
        packQuantity: 3,
        servings: 90,
        durationMonths: 3,
        totalWeightGrams: 600,
        sellingPriceInPaise: 489900, // ₹4,899.00
        mrpInPaise: 749900,          // ₹7,499.00
        compareAtPriceInPaise: 749900,
        badge: 'Best Value',
        isPopular: true,
        isActive: true,
      },
    ],
    images: [
      {
        id: 'img-1',
        src: '/images/gutglow-product-front.jpg',
        alt: 'GutGlow Daily Wellness Formula front view on stone pedestal with powder bowl',
        label: 'Front Packaging',
        isPrimary: true,
        displayOrder: 1,
      },
      {
        id: 'img-2',
        src: '/images/gutglow-product-angle.jpg',
        alt: 'GutGlow Daily Wellness Formula angled view on stone with wooden scoop',
        label: 'Angle & Scoop',
        isPrimary: false,
        displayOrder: 2,
      },
      {
        id: 'img-3',
        src: '/images/philosophy-ritual.webp',
        alt: 'GutGlow daily morning wellness ritual with spoon and jar on stone',
        label: 'Daily Ritual',
        isPrimary: false,
        displayOrder: 3,
      },
      {
        id: 'img-4',
        src: '/images/product-packaging-macro.jpg',
        alt: 'GutGlow close-up packaging detail and letterpress typography',
        label: 'Macro Detail',
        isPrimary: false,
        displayOrder: 4,
      },
      {
        id: 'img-5',
        src: '/images/product-botanicals.jpg',
        alt: 'GutGlow carefully sourced active natural botanicals',
        label: 'Active Botanicals',
        isPrimary: false,
        displayOrder: 5,
      },
    ],
    highlights: [
      'Supports daily digestive ease and regularity',
      'Prebiotic fiber matrix to feed beneficial microflora',
      'Gentle botanical soothing blend',
      'Zero artificial sweeteners, fillers or synthetics',
      'UV-protective recyclable glass packaging',
    ],
    features: [
      {
        title: 'Quality Focused',
        description: 'Crafted in certified facilities with rigorous batch testing.',
      },
      {
        title: 'Thoughtful Formulation',
        description: 'Plant-derived ingredients selected for physiological tolerability.',
      },
      {
        title: 'Transparent Information',
        description: 'Full disclosure of all ingredients and no hidden blends.',
      },
      {
        title: 'Everyday Wellness',
        description: 'Seamlessly blends into water with a subtle, natural taste.',
      },
    ],
    specifications: [
      { label: 'Form', value: 'Fine dispersible powder' },
      { label: 'Net Weight', value: '200g (30 Servings)' },
      { label: 'Shelf Life', value: '24 Months from MFD' },
      { label: 'Dietary', value: '100% Plant-Based & Vegan' },
      { label: 'Allergens', value: 'Gluten-Free, Dairy-Free, Soy-Free' },
      { label: 'Origin', value: 'Formulated and packed in India' },
    ],
    ingredientsNote: 'Botanical ingredients in targeted, synergistic proportions.',
    provisionalIngredients: [
      {
        category: 'Digestive Ease Botanicals',
        items: ['Licorice Root (DGL)', 'Marshmallow Root Extract', 'Ginger Rhizome'],
        purpose: 'Soothes gut lining and promotes natural mucosal integrity',
      },
      {
        category: 'Prebiotic Fiber Complex',
        items: ['Acacia Senegal Fiber', 'Organic Partially Hydrolyzed Guar Gum'],
        purpose: 'Nourishes beneficial gut microflora without sudden gas or bloating',
      },
      {
        category: 'Cellular Gut Support',
        items: ['L-Glutamine', 'Zinc Carnosine'],
        purpose: 'Supports tight junction integrity and cellular rejuvenation',
      },
    ],
    directions: [
      {
        step: 'Scoop & Measure',
        instruction: 'Add 1 level scoop (~6.5g) to a clean glass.',
      },
      {
        step: 'Pour Water',
        instruction: 'Pour 200–250ml of room temperature or lukewarm water.',
      },
      {
        step: 'Stir & Drink',
        instruction: 'Stir gently for 15 seconds until dissolved. Drink first thing in the morning.',
      },
    ],
    safetyInformation: [
      'Consult a healthcare professional before use if pregnant, nursing, or taking prescription medication.',
      'This product is not intended to diagnose, treat, cure, or prevent any disease.',
      'Keep out of reach of children.',
    ],
    storageInstructions: 'Store in a cool, dry place away from direct sunlight. Reseal cap tightly after each use.',
    averageRating: 4.9,
    reviewCount: 128,
    totalPhysicalJarsSold: 1420,
    seo: {
      metaTitle: 'GutGlow Daily Wellness Formula | Clean Digestive Health Powder',
      metaDescription: 'Targeted prebiotics and soothing botanicals to support daily digestive wellness, regularity, and gut comfort.',
      keywords: ['gut health powder', 'prebiotics', 'digestive wellness', 'plant-based gut care', 'GutGlow'],
    },
    createdAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
  });
  console.log(`   ✅ Product seeded: products/${productId}`);

  // 3. SEED PHYSICAL INVENTORY (Base SKU: GG-DWF-200G)
  console.log('\n3️⃣  Seeding Warehouse Inventory: "inventory/GG-DWF-200G"...');
  const inventoryRef = db.collection('inventory').doc('GG-DWF-200G');
  await inventoryRef.set({
    sku: 'GG-DWF-200G',
    productName: 'GutGlow Daily Wellness Formula (200g Glass Jar)',
    quantityAvailable: 1500,
    quantityReserved: 0,
    quantityTotal: 1500,
    lowStockThreshold: 100,
    updatedAt: FieldValue.serverTimestamp(),
  });

  const now = new Date();
  const expiryDate = new Date();
  expiryDate.setFullYear(now.getFullYear() + 2);

  await inventoryRef.collection('batches').doc('BATCH-2026-001').set({
    batchNumber: 'GG-BATCH-2026-001',
    sku: 'GG-DWF-200G',
    quantityInitial: 1500,
    quantityAvailable: 1500,
    quantitySold: 0,
    quantityQuarantined: 0,
    status: 'active',
    manufacturingDate: Timestamp.fromDate(now),
    expiryDate: Timestamp.fromDate(expiryDate),
    createdAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
  });
  console.log('   ✅ Physical Inventory & Batch seeded: inventory/GG-DWF-200G/batches/BATCH-2026-001');

  // 4. SEED STORE CONFIGURATION
  console.log('\n4️⃣  Seeding Store Configuration: "settings/store_config"...');
  await db.collection('settings').doc('store_config').set({
    storeName: 'GutGlow',
    currency: 'INR',
    minShelfLifeMonthsAtDispatch: 6,
    returnWindowDays: 7,
    defaultGstRateBasisPoints: 1800,
    partialCodAdvanceAmountInPaise: 15000, // ₹150.00 Partial COD advance
    legalBusinessName: 'GutGlow Wellness Private Limited',
    fssaiLicenseNumber: '11524998000123',
    gstin: '27AABCU9603R1ZM',
    supportEmail: 'care@gutglow.com',
    supportPhone: '+91 98765 43210',
    warehouseAddress: {
      line1: 'Plot 42, Logistics Park, Bhiwandi',
      city: 'Thane',
      state: 'Maharashtra',
      pincode: '421302',
      country: 'India',
    },
    updatedAt: FieldValue.serverTimestamp(),
  });
  console.log('   ✅ Store Configuration seeded: settings/store_config');

  console.log('\n═══════════════════════════════════════════════════════════════════════════════');
  console.log('🎉  ALL MASTER CATALOG & INVENTORY DATA SEEDED SUCCESSFULLY!');
  console.log('═══════════════════════════════════════════════════════════════════════════════');
}

seedMasterData().catch((err) => {
  console.error('❌ Seeding failed:', err);
  process.exit(1);
});
