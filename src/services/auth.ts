import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  sendEmailVerification,
  User
} from 'firebase/auth';
import { doc, setDoc, getDoc, Timestamp, collection, query, where, getDocs } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { auth, db, storage } from '@/lib/firebase';

export interface UserProfile {
  id: string;
  name: string;
  username: string;
  email: string;
  description: string;
  photoURL?: string;
  profile_image_url?: string; // deprecated, use photoURL
  created_at: Date;
  updated_at: Date;
}

export const checkUsernameAvailable = async (username: string): Promise<boolean> => {
  try {
    console.log('[checkUsernameAvailable] Checking username:', username);
    const normalizedUsername = username.toLowerCase().trim();
    const usersRef = collection(db, 'users');
    const q = query(usersRef, where('username', '==', normalizedUsername));

    console.log('[checkUsernameAvailable] Executing query...');
    const snapshot = await getDocs(q);

    console.log('[checkUsernameAvailable] Query results:', {
      empty: snapshot.empty,
      size: snapshot.size,
      docs: snapshot.docs.map(doc => doc.data().username)
    });

    return snapshot.empty;
  } catch (error: any) {
    console.error('[checkUsernameAvailable] Error checking username:', error);
    console.error('[checkUsernameAvailable] Error code:', error.code);
    console.error('[checkUsernameAvailable] Error message:', error.message);

    // If we get a permission error, we can't check - assume not available for safety
    if (error.code === 'permission-denied') {
      console.warn('[checkUsernameAvailable] Permission denied - cannot verify username availability');
      throw new Error('Unable to verify username availability. Please try again.');
    }

    throw error;
  }
};

export const signUp = async (email: string, password: string, name: string, username: string) => {
  try {
    console.log('[signUp] Starting signup process for:', email);

    // Try to check username, but don't block signup if check fails
    try {
      const isAvailable = await checkUsernameAvailable(username);
      if (!isAvailable) {
        throw new Error('Username is already taken');
      }
    } catch (checkError: any) {
      console.warn('[signUp] Username check failed, proceeding with signup:', checkError.message);
      // Continue with signup - we'll check again during account creation
    }

    console.log('[signUp] Creating user account...');
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    console.log('[signUp] User created with UID:', user.uid);

    // Double-check username availability now that we're authenticated
    console.log('[signUp] Verifying username availability after auth...');
    const isAvailableNow = await checkUsernameAvailable(username);
    if (!isAvailableNow) {
      // Username taken - delete the account and fail
      console.error('[signUp] Username taken, deleting account...');
      await user.delete();
      throw new Error('Username is already taken');
    }

    // Send verification email
    console.log('[signUp] Sending verification email to:', user.email);
    try {
      await sendEmailVerification(user);
      console.log('[signUp] Verification email sent successfully!');
    } catch (emailError: any) {
      console.error('[signUp] Failed to send verification email:', emailError);
      console.error('[signUp] Error code:', emailError.code);
      console.error('[signUp] Error message:', emailError.message);
      // Don't throw - continue with account creation even if email fails
    }

    console.log('[signUp] Creating user profile document...');
    const userProfile: Omit<UserProfile, 'id'> = {
      name,
      username: username.toLowerCase().trim(),
      email,
      description: '',
      photoURL: '',
      created_at: Timestamp.now() as any,
      updated_at: Timestamp.now() as any
    };

    await setDoc(doc(db, 'users', user.uid), userProfile);
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

    await setDoc(doc(db, 'userStats', user.uid), userStats);
    console.log('[signUp] User stats created');
    console.log('[signUp] Signup completed successfully!');

    return user;
  } catch (error: any) {
    console.error('[signUp] Signup failed:', error);
    throw error;
  }
};

export const resendVerificationEmail = async () => {
  const user = auth.currentUser;
  if (!user) throw new Error('No user logged in');
  await sendEmailVerification(user);
};

export const getUserByUsername = async (username: string): Promise<string | null> => {
  const normalizedUsername = username.toLowerCase().trim();
  const usersRef = collection(db, 'users');
  const q = query(usersRef, where('username', '==', normalizedUsername));
  const snapshot = await getDocs(q);

  if (!snapshot.empty) {
    const userDoc = snapshot.docs[0];
    return userDoc.data().email;
  }
  return null;
};

export const signIn = async (email: string, password: string) => {
  try {
    console.log('[signIn] Attempting to sign in with email:', email);
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    console.log('[signIn] Sign in successful, user:', userCredential.user?.uid);

    if (!userCredential.user) {
      throw new Error('Authentication failed - no user returned');
    }

    return userCredential.user;
  } catch (error: any) {
    console.error('[signIn] Sign in error:', error);
    throw new Error(error.message || 'Failed to sign in');
  }
};

export const signOut = async () => {
  await firebaseSignOut(auth);
};

export const getUserProfile = async (userId: string): Promise<UserProfile | null> => {
  const docRef = doc(db, 'users', userId);
  const docSnap = await getDoc(docRef);
  if (docSnap.exists()) {
    return { id: docSnap.id, ...docSnap.data() } as UserProfile;
  }
  return null;
};

export const updateUserProfile = async (userId: string, updates: any) => {
  try {
    console.log('[updateUserProfile] Updating profile...', { userId, updates });

    const docRef = doc(db, 'users', userId);

    // Clean up the updates object - remove any undefined values
    const cleanUpdates: any = {};
    Object.keys(updates).forEach(key => {
      if (updates[key] !== undefined) {
        cleanUpdates[key] = updates[key];
      }
    });

    // Add timestamp
    cleanUpdates.updated_at = Timestamp.now();

    console.log('[updateUserProfile] Clean updates:', cleanUpdates);

    await setDoc(docRef, cleanUpdates, { merge: true });

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
