import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { onAuthChange, signIn, signUp, signOut as firebaseSignOut } from '@/services/auth';
import { FirebaseAuthentication } from '@capacitor-firebase/authentication';
import { NativeUser } from '@/types/user';

// Check if running in Capacitor
const isCapacitor = typeof window !== 'undefined' && (window as any).Capacitor;

interface AuthContextType {
  user: NativeUser | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<NativeUser>;
  signUp: (email: string, password: string, name: string) => Promise<NativeUser>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<NativeUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log('[AuthProvider] Initializing auth listener...');
    console.log('[AuthProvider] Platform:', isCapacitor ? 'Capacitor (Native iOS)' : 'Web');
    let didFire = false;
    let timeout: NodeJS.Timeout;
    let unsubscribe: (() => void) | undefined;

    const initAuth = async () => {
      if (isCapacitor) {
        // Use native plugin auth state listener on iOS
        console.log('[AuthProvider] Using native auth state listener');

        // Add listener for native auth state changes
        let previousUserId: string | null = null;
        const listener = await FirebaseAuthentication.addListener('authStateChange', (change) => {
          didFire = true;
          if (timeout) clearTimeout(timeout);
          const newUser = change.user as NativeUser | null;
          console.log('[AuthProvider] Native auth state changed:', newUser ? `User: ${newUser.uid}` : 'No user');

          // If user changed (not just login/logout), force reload to clear cache
          if (previousUserId && newUser && previousUserId !== newUser.uid) {
            console.log('[AuthProvider] ⚠️ User switched! Reloading to clear cache...');
            window.location.reload();
            return;
          }

          previousUserId = newUser?.uid || null;
          setUser(newUser);
          setLoading(false);
        });

        unsubscribe = () => {
          listener.remove();
        };

        // Also get current auth state immediately
        try {
          const result = await FirebaseAuthentication.getCurrentUser();
          if (result.user) {
            console.log('[AuthProvider] Current native user:', result.user.uid);
            previousUserId = result.user.uid; // Initialize previous user ID
            // Use native user directly
            setUser(result.user as NativeUser);
            setLoading(false);
            didFire = true;
          } else {
            console.log('[AuthProvider] No current user');
            previousUserId = null;
            setUser(null);
            setLoading(false);
            didFire = true;
          }
        } catch (error) {
          console.error('[AuthProvider] Error getting current user:', error);
          previousUserId = null;
          setUser(null);
          setLoading(false);
          didFire = true;
        }
      } else {
        // Use web SDK for auth state on web platform
        console.log('[AuthProvider] Using web auth state listener');

        unsubscribe = onAuthChange((authUser) => {
          didFire = true;
          if (timeout) clearTimeout(timeout);
          console.log('[AuthProvider] Auth state changed:', authUser ? `User: ${authUser.uid}` : 'No user');
          setUser(authUser);
          setLoading(false);
        });
      }

      // Safety timeout - if auth doesn't respond in 3 seconds, stop loading
      timeout = setTimeout(() => {
        if (!didFire) {
          console.warn('[AuthProvider] Timeout - auth not responding after 3s');
          setLoading(false);
          setUser(null);
        }
      }, 3000);
    };

    initAuth();

    return () => {
      console.log('[AuthProvider] Cleaning up auth listener');
      if (timeout) clearTimeout(timeout);
      if (unsubscribe) unsubscribe();
    };
  }, []);

  const value = {
    user,
    loading,
    signIn,
    signUp,
    signOut: firebaseSignOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
