import { initializeApp, getApps, getApp } from 'firebase/app';
import { getStorage } from 'firebase/storage';

// Check if running in Capacitor
const isCapacitor = typeof window !== 'undefined' && (window as any).Capacitor;

// Firebase config - ONLY for web platform
// On iOS: Native Firebase plugins use GoogleService-Info.plist
const firebaseConfig = {
  apiKey: "AIzaSyB7H6m2OPFlTx2_QYv2PZoT73JiRCNRV-I",
  authDomain: "boxboxd-web-new.firebaseapp.com",
  projectId: "boxboxd-web-new",
  storageBucket: "boxboxd-web-new.firebasestorage.app",
  messagingSenderId: "1033200550139",
  appId: "1:1033200550139:web:0230ea06efd7054aa0f05e"
};

console.log('[Firebase] Platform:', isCapacitor ? 'iOS (Native Plugins)' : 'Web (Web SDK)');

// Initialize Firebase app (needed for storage)
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// Storage (still uses Web SDK on both platforms)
export const storage = getStorage(app);

// Auth - lazy loaded only when needed on web
let _auth: any = null;
export const auth = new Proxy({} as any, {
  get: (target, prop) => {
    if (!_auth) {
      if (isCapacitor) {
        console.warn('[Firebase] auth.currentUser not available on native - use getCurrentUser() from auth-native.ts');
        return null;
      }
      const { getAuth } = require('firebase/auth');
      _auth = getAuth(app);
    }
    return _auth[prop];
  }
});

export default app;
