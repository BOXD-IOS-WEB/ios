import { FirebaseAuthentication } from '@capacitor-firebase/authentication';
import { NativeUser } from '@/types/user';
import { auth as webAuth } from './firebase';

// Check if running in Capacitor
const isCapacitor = typeof window !== 'undefined' && (window as any).Capacitor;

/**
 * Get the current authenticated user
 * Uses native Firebase on iOS, Web SDK on web
 */
export const getCurrentUser = async (): Promise<NativeUser | null> => {
  if (isCapacitor) {
    try {
      const result = await FirebaseAuthentication.getCurrentUser();
      return result.user as NativeUser | null;
    } catch (error) {
      console.error('[Auth Native] Error getting current user:', error);
      return null;
    }
  } else {
    return webAuth.currentUser as NativeUser | null;
  }
};

/**
 * Get current user synchronously (only works after auth is initialized)
 */
export const getCurrentUserSync = (): NativeUser | null => {
  if (isCapacitor) {
    // For native, this is not reliable - use getCurrentUser() instead
    console.warn('[Auth Native] getCurrentUserSync not reliable on native - use getCurrentUser()');
    return null;
  } else {
    return webAuth.currentUser as NativeUser | null;
  }
};

/**
 * Send password reset email
 */
export const sendPasswordReset = async (email: string): Promise<void> => {
  if (isCapacitor) {
    await FirebaseAuthentication.sendPasswordResetEmail({ email });
  } else {
    const { sendPasswordResetEmail } = await import('firebase/auth');
    await sendPasswordResetEmail(webAuth, email);
  }
};

/**
 * Update user password
 */
export const updateUserPassword = async (newPassword: string): Promise<void> => {
  if (isCapacitor) {
    await FirebaseAuthentication.updatePassword({ newPassword });
  } else {
    const { updatePassword } = await import('firebase/auth');
    const user = webAuth.currentUser;
    if (!user) throw new Error('No user logged in');
    await updatePassword(user, newPassword);
  }
};

/**
 * Delete current user account
 */
export const deleteUserAccount = async (): Promise<void> => {
  if (isCapacitor) {
    // Note: Native plugin requires recent sign-in
    const user = await getCurrentUser();
    if (!user) throw new Error('No user logged in');

    // Use Web SDK for delete as native plugin doesn't have this method
    const { deleteUser } = await import('firebase/auth');
    await deleteUser(user as any);
  } else {
    const { deleteUser } = await import('firebase/auth');
    const user = webAuth.currentUser;
    if (!user) throw new Error('No user logged in');
    await deleteUser(user);
  }
};

/**
 * Re-authenticate user with email and password
 */
export const reauthenticateUser = async (email: string, password: string): Promise<void> => {
  if (isCapacitor) {
    // Native: just sign in again to re-authenticate
    await FirebaseAuthentication.signInWithEmailAndPassword({ email, password });
  } else {
    const { EmailAuthProvider, reauthenticateWithCredential } = await import('firebase/auth');
    const user = webAuth.currentUser;
    if (!user) throw new Error('No user logged in');
    const credential = EmailAuthProvider.credential(email, password);
    await reauthenticateWithCredential(user, credential);
  }
};

/**
 * Listen to auth state changes
 */
export const onAuthStateChange = (callback: (user: NativeUser | null) => void) => {
  if (isCapacitor) {
    // Use native listener
    let hasInitialized = false;

    const setupListener = async () => {
      // Get current user first
      const currentUser = await getCurrentUser();
      if (!hasInitialized) {
        callback(currentUser);
        hasInitialized = true;
      }

      // Then listen for changes
      const listener = await FirebaseAuthentication.addListener('authStateChange', (change) => {
        callback(change.user as NativeUser | null);
      });

      return () => {
        listener.remove();
      };
    };

    let unsubscribe: (() => void) | undefined;
    setupListener().then(unsub => {
      unsubscribe = unsub;
    });

    return () => {
      if (unsubscribe) unsubscribe();
    };
  } else {
    const { onAuthStateChanged } = require('firebase/auth');
    return onAuthStateChanged(webAuth, (user: any) => callback(user as NativeUser | null));
  }
};
