import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, setPersistence, browserLocalPersistence } from 'firebase/auth';
import { getFirestore, initializeFirestore, memoryLocalCache, clearIndexedDbPersistence } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: "AIzaSyAxxOGSqsd79qXvGUz7FEKgBuc-pafGE9A",
  authDomain: "box-boxd-f1-1759326853.firebaseapp.com",
  projectId: "box-boxd-f1-1759326853",
  storageBucket: "box-boxd-f1-1759326853.appspot.com",
  messagingSenderId: "750144678811",
  appId: "1:750144678811:web:47f55a4293e9b7e66dcf3e"
};

// Clear any cached Firestore data to force re-fetch of rules
// This is a one-time fix for cached permission rules
if (typeof window !== 'undefined' && !getApps().length) {
  const dbName = `firestore/${firebaseConfig.projectId}/(default)`;
  indexedDB.deleteDatabase(dbName).onsuccess = () => {
    console.log('[Firebase] Cleared Firestore IndexedDB cache');
  };
}

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// IMPORTANT: Always use initializeFirestore on first init to disable cache
// This fixes permission-denied errors caused by cached old rules
let db: any;
try {
  // Try to initialize with no cache
  db = initializeFirestore(app, {
    localCache: memoryLocalCache()
  });
  console.log('[Firebase] Initialized Firestore with memory cache');
} catch (error: any) {
  // If already initialized, get the existing instance
  console.warn('[Firebase] Firestore already initialized, using existing instance');
  db = getFirestore(app);
}

export const auth = getAuth(app);
export { db };
export const storage = getStorage(app);

// Debug logging
console.log('[Firebase] Configuration:', {
  projectId: firebaseConfig.projectId,
  authDomain: firebaseConfig.authDomain,
  databaseURL: db._databaseId?.database || '(default)'
});

console.log('[Firebase] Firestore instance:', {
  app: db.app.name,
  type: db.type,
  toJSON: db.toJSON()
});

// Enable auth persistence
setPersistence(auth, browserLocalPersistence).catch((error) => {
  console.error('Error setting auth persistence:', error);
});

// Debug: Log auth state changes (per article recommendation)
auth.onAuthStateChanged((user) => {
  if (user) {
    console.log('[Firebase Auth] ✅ User signed in:', {
      uid: user.uid,
      email: user.email,
      emailVerified: user.emailVerified
    });
  } else {
    console.log('[Firebase Auth] ❌ No user signed in');
  }
});

export default app;
