import { initializeApp, getApps, getApp, type FirebaseApp } from 'firebase/app';
import { getAuth, connectAuthEmulator, type Auth } from 'firebase/auth';
import { getFirestore, connectFirestoreEmulator, type Firestore } from 'firebase/firestore';
import { getStorage, connectStorageEmulator, type FirebaseStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || 'AIzaSyDummyKeyForBuildPrerender0000000',
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || 'gutglow-development.firebaseapp.com',
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'gutglow-development',
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || 'gutglow-development.appspot.com',
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || '1234567890',
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || '1:1234567890:web:abcdef',
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

// Singleton pattern with Next.js Fast Refresh / HMR guard
const app: FirebaseApp = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

let auth: Auth;
try {
  auth = getAuth(app);
} catch {
  // Safe fallback for SSR build-time evaluation without active credentials
  auth = {} as Auth;
}

let db: Firestore;
try {
  db = getFirestore(app);
} catch {
  db = {} as Firestore;
}

let storage: FirebaseStorage;
try {
  storage = getStorage(app);
} catch {
  storage = {} as FirebaseStorage;
}

// Connect to local emulators if configured and running client-side
if (
  typeof window !== 'undefined' &&
  process.env.NEXT_PUBLIC_USE_FIREBASE_EMULATOR === 'true' &&
  !(window as unknown as { __FIREBASE_EMULATORS_CONNECTED__?: boolean }).__FIREBASE_EMULATORS_CONNECTED__
) {
  try {
    connectAuthEmulator(auth, 'http://localhost:9099', { disableWarnings: true });
    connectFirestoreEmulator(db, 'localhost', 8080);
    connectStorageEmulator(storage, 'localhost', 9199);
    (window as unknown as { __FIREBASE_EMULATORS_CONNECTED__?: boolean }).__FIREBASE_EMULATORS_CONNECTED__ = true;
    console.log('[Firebase Client] Connected to local emulator suite');
  } catch (error) {
    console.warn('[Firebase Client] Failed to connect to emulators:', error);
  }
}

export { app, auth, db, storage };
