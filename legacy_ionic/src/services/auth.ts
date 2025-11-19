import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendEmailVerification,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  User,
} from 'firebase/auth';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { auth, storage } from '@/lib/firebase';
import { FirebaseAuthentication } from '@capacitor-firebase/authentication';
import { getDocument, setDocument, serverTimestamp, timestampToDate } from '@/lib/firestore-native';
import { NativeUser } from '@/types/user';

// Check if running in Capacitor
const isCapacitor = typeof window !== 'undefined' && (window as any).Capacitor;

// Cloud Function URL for custom token generation
const GENERATE_CUSTOM_TOKEN_URL = 'https://us-central1-boxboxd-web-new.cloudfunctions.net/generateCustomToken';

/**
 * Helper function to generate a custom token from an ID token
 * This is used to sync native iOS auth with Web SDK
 */
const generateCustomToken = async (idToken: string): Promise<string> => {
  console.log('[generateCustomToken] Calling Cloud Function...');

  const response = await fetch(GENERATE_CUSTOM_TOKEN_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ idToken }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to generate custom token');
  }

  const data = await response.json();
  console.log('[generateCustomToken] Custom token generated for user:', data.uid);
  return data.customToken;
};

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  description: string;
  photoURL?: string;
  profile_image_url?: string; // deprecated, use photoURL
  created_at: Date;
  updated_at: Date;
}

export const signUp = async (email: string, password: string, name: string): Promise<NativeUser> => {
  try {
    console.log('[signUp] Starting signup process for:', email);
    console.log('[signUp] Platform:', isCapacitor ? 'Capacitor (Native iOS)' : 'Web');

    let user: NativeUser;

    if (isCapacitor) {
      // Use native Firebase plugin on iOS
      console.log('[signUp] Creating user with native Firebase SDK...');
      const result = await FirebaseAuthentication.createUserWithEmailAndPassword({
        email,
        password,
      });
      console.log('[signUp] ✅ User created with UID:', result.user?.uid);

      if (!result.user) {
        throw new Error('Failed to create user - no user returned');
      }

      user = result.user as NativeUser;

      // Send verification email (native)
      console.log('[signUp] Sending verification email via native plugin...');
      try {
        await FirebaseAuthentication.sendEmailVerification();
        console.log('[signUp] Verification email sent successfully!');
      } catch (emailError: any) {
        console.error('[signUp] Failed to send verification email:', emailError);
      }
    } else {
      // Use web SDK
      console.log('[signUp] Creating user account with web SDK...');
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      user = userCredential.user as NativeUser;
      console.log('[signUp] User created with UID:', user.uid);

      // Send verification email (web)
      try {
        await sendEmailVerification(userCredential.user);
        console.log('[signUp] Verification email sent successfully!');
      } catch (emailError: any) {
        console.error('[signUp] Failed to send verification email:', emailError);
      }
    }

    console.log('[signUp] Creating user profile document...');
    const userProfile: Omit<UserProfile, 'id'> = {
      name,
      email,
      description: '',
      photoURL: '',
      created_at: serverTimestamp() as any,
      updated_at: serverTimestamp() as any
    };

    await setDocument(`users/${user.uid}`, userProfile);
    console.log('[signUp] User profile created');

    console.log('[signUp] Creating user stats document...');
    const userStats = {
      racesWatched: 0,
      reviewsCount: 0,
      listsCount: 0,
      followersCount: 0,
      followingCount: 0,
      totalHoursWatched: 0,
      favoriteDriver: '',
      favoriteCircuit: '',
      favoriteTeam: ''
    };

    await setDocument(`userStats/${user.uid}`, userStats);
    console.log('[signUp] User stats created');
    console.log('[signUp] Signup completed successfully!');

    return user;
  } catch (error: any) {
    console.error('[signUp] Signup failed:', error);
    throw error;
  }
};

export const resendVerificationEmail = async () => {
  if (isCapacitor) {
    await FirebaseAuthentication.sendEmailVerification();
  } else {
    const user = auth.currentUser;
    if (!user) throw new Error('No user logged in');
    await sendEmailVerification(user);
  }
};

export const signIn = async (email: string, password: string): Promise<NativeUser> => {
  try {
    console.log('[signIn] Attempting to sign in with email:', email);
    console.log('[signIn] Platform:', isCapacitor ? 'Capacitor (Native iOS)' : 'Web');

    if (isCapacitor) {
      // Use native Firebase plugin on iOS
      console.log('[signIn] Signing in with native Firebase SDK...');
      const result = await FirebaseAuthentication.signInWithEmailAndPassword({
        email,
        password,
      });
      console.log('[signIn] ✅ Native sign in successful, user:', result.user?.uid);

      if (!result.user) {
        throw new Error('Authentication failed - no user returned');
      }

      return result.user as NativeUser;
    } else {
      // Use web SDK on web platform
      console.log('[signIn] Using Firebase Web SDK for authentication');
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      console.log('[signIn] ✅ Sign in successful, user:', userCredential.user?.uid);

      if (!userCredential.user) {
        throw new Error('Authentication failed - no user returned');
      }

      return userCredential.user as NativeUser;
    }
  } catch (error: any) {
    console.error('[signIn] ❌ Sign in error:', {
      code: error.code,
      message: error.message,
      stack: error.stack
    });
    throw new Error(error.message || 'Failed to sign in');
  }
};

export const signOut = async () => {
  if (isCapacitor) {
    // Use native Firebase plugin on iOS
    console.log('[signOut] Signing out with native SDK');

    // Clear Firestore cache before signing out to prevent showing cached data from previous user
    try {
      const { FirebaseFirestore } = await import('@capacitor-firebase/firestore');
      await FirebaseFirestore.clearPersistence();
      console.log('[signOut] Firestore cache cleared');
    } catch (error) {
      console.error('[signOut] Failed to clear Firestore cache:', error);
      // Continue with sign out even if cache clear fails
    }

    await FirebaseAuthentication.signOut();
  } else {
    // Use web SDK
    console.log('[signOut] Signing out with web SDK');

    // Clear Firestore cache for web
    try {
      const { clearIndexedDbPersistence } = await import('firebase/firestore');
      const { db } = await import('@/lib/firebase');
      await clearIndexedDbPersistence(db);
      console.log('[signOut] Web Firestore cache cleared');
    } catch (error) {
      console.error('[signOut] Failed to clear web Firestore cache:', error);
      // Continue with sign out even if cache clear fails
    }

    await firebaseSignOut(auth);
  }

  // Force reload to clear any in-memory state
  if (typeof window !== 'undefined') {
    setTimeout(() => {
      window.location.href = '/login';
    }, 100);
  }
};

export const getUserProfile = async (userId: string): Promise<UserProfile | null> => {
  try {
    console.log('[getUserProfile] Fetching profile for user:', userId);
    const data = await getDocument(`users/${userId}`);

    if (data) {
      console.log('[getUserProfile] ✅ Profile found');
      return { id: userId, ...data } as UserProfile;
    }

    console.log('[getUserProfile] No profile found');
    return null;
  } catch (error) {
    console.error('[getUserProfile] ❌ Error:', error);
    throw error;
  }
};

export const updateUserProfile = async (userId: string, updates: any) => {
  try {
    console.log('[updateUserProfile] Updating profile...', { userId, updates });

    // Clean up the updates object - remove any undefined values
    const cleanUpdates: any = {};
    Object.keys(updates).forEach(key => {
      if (updates[key] !== undefined) {
        cleanUpdates[key] = updates[key];
      }
    });

    // Add timestamp
    cleanUpdates.updated_at = serverTimestamp();

    console.log('[updateUserProfile] Clean updates:', cleanUpdates);

    await setDocument(`users/${userId}`, cleanUpdates, true);

    console.log('[updateUserProfile] Profile updated successfully!');
  } catch (error: any) {
    console.error('[updateUserProfile] Failed to update profile:', error);
    throw new Error(`Failed to update profile: ${error.message}`);
  }
};

export const onAuthChange = (callback: (user: User | null) => void) => {
  return onAuthStateChanged(auth, callback);
};

export const uploadProfilePicture = async (userId: string, file: File): Promise<string> => {
  try {
    console.log('[uploadProfilePicture] Starting upload...', { userId, fileName: file.name, fileSize: file.size });

    const fileExtension = file.name.split('.').pop();
    const fileName = `${userId}_${Date.now()}.${fileExtension}`;
    const storageRef = ref(storage, `profile-pictures/${fileName}`);

    console.log('[uploadProfilePicture] Uploading to storage...', { path: `profile-pictures/${fileName}` });

    // Add timeout to prevent hanging
    const uploadPromise = uploadBytes(storageRef, file);
    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Upload timeout after 30 seconds')), 30000)
    );

    await Promise.race([uploadPromise, timeoutPromise]);

    console.log('[uploadProfilePicture] Getting download URL...');
    const downloadURL = await getDownloadURL(storageRef);

    console.log('[uploadProfilePicture] Upload complete!', { downloadURL });
    return downloadURL;
  } catch (error: any) {
    console.error('[uploadProfilePicture] Upload failed:', error);
    throw new Error(`Failed to upload profile picture: ${error.message}`);
  }
};
