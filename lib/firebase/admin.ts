import { initializeApp, getApps, getApp, cert, type App } from 'firebase-admin/app';
import { getAuth, type Auth } from 'firebase-admin/auth';
import { getFirestore, type Firestore } from 'firebase-admin/firestore';
import { getStorage, type Storage } from 'firebase-admin/storage';

function formatPrivateKey(key: string | undefined): string | undefined {
  if (!key) return undefined;
  // Replace escaped newlines if passed as single-line string
  return key.replace(/\\n/g, '\n');
}

function initializeFirebaseAdmin(): App {
  if (getApps().length > 0) {
    return getApp();
  }

  const projectId = process.env.FIREBASE_ADMIN_PROJECT_ID || process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_ADMIN_CLIENT_EMAIL;
  const privateKey = formatPrivateKey(process.env.FIREBASE_ADMIN_PRIVATE_KEY);
  const storageBucket = process.env.FIREBASE_ADMIN_STORAGE_BUCKET || process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET;

  // If running with local emulator or explicit credentials
  if (process.env.NEXT_PUBLIC_USE_FIREBASE_EMULATOR === 'true') {
    return initializeApp({
      projectId: projectId || 'gutglow-development',
      storageBucket,
    });
  }

  if (projectId && clientEmail && privateKey) {
    return initializeApp({
      projectId,
      credential: cert({
        projectId,
        clientEmail,
        privateKey,
      }),
      storageBucket,
    });
  }

  // Fallback to default application credentials if running in GCP runtime
  return initializeApp({
    projectId,
    storageBucket,
  });
}

const adminApp: App = initializeFirebaseAdmin();
const adminAuth: Auth = getAuth(adminApp);
const adminDb: Firestore = getFirestore(adminApp);
const adminStorage: Storage = getStorage(adminApp);

export { adminApp, adminAuth, adminDb, adminStorage };
