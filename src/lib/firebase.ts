import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, setPersistence, browserLocalPersistence, indexedDBLocalPersistence } from 'firebase/auth';
import { getFirestore, initializeFirestore, memoryLocalCache, clearIndexedDbPersistence } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: "AIzaSyB7H6m2OPFlTx2_QYv2PZoT73JiRCNRV-I",
  authDomain: "boxboxd-web-new.firebaseapp.com",
  projectId: "boxboxd-web-new",
  storageBucket: "boxboxd-web-new.firebasestorage.app",
  messagingSenderId: "1033200550139",
  appId: "1:1033200550139:web:0230ea06efd7054aa0f05e"
};

// Clear any cached Firestore data to force re-fetch of rules
// This is a one-time fix for cached permission rules
if (typeof window !== 'undefined' && !getApps().length) {
  try {
    const dbName = `firestore/${firebaseConfig.projectId}/(default)`;
    indexedDB.deleteDatabase(dbName).onsuccess = () => {
      console.log('[Firebase] Cleared Firestore IndexedDB cache');
    };
  } catch (error) {
    console.warn('[Firebase] Could not clear IndexedDB cache:', error);
  }
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

// Enable auth persistence with fallback
// Try IndexedDB first (more reliable), then fall back to localStorage
const enablePersistence = async () => {
  try {
    // Try IndexedDB persistence first (more reliable on iOS/iPadOS)
    await setPersistence(auth, indexedDBLocalPersistence);
    console.log('[Firebase Auth] ✅ IndexedDB persistence enabled');
  } catch (error: any) {
    console.warn('[Firebase Auth] ⚠️ IndexedDB persistence failed, falling back to localStorage:', error);
    try {
      await setPersistence(auth, browserLocalPersistence);
      console.log('[Firebase Auth] ✅ LocalStorage persistence enabled');
    } catch (fallbackError) {
      console.error('[Firebase Auth] ❌ Error setting auth persistence:', fallbackError);
    }
  }
};

enablePersistence();

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
