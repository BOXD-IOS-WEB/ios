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
  const normalizedUsername = username.toLowerCase().trim();
  const usersRef = collection(db, 'users');
  const q = query(usersRef, where('username', '==', normalizedUsername));
  const snapshot = await getDocs(q);
  return snapshot.empty;
};

export const signUp = async (email: string, password: string, name: string, username: string) => {
  const isAvailable = await checkUsernameAvailable(username);
  if (!isAvailable) {
    throw new Error('Username is already taken');
  }
  const userCredential = await createUserWithEmailAndPassword(auth, email, password);
  const user = userCredential.user;

  // Send verification email
  await sendEmailVerification(user);

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

  return user;
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
