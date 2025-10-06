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
  profile_image_url: string;
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
    profile_image_url: '',
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
  const userCredential = await signInWithEmailAndPassword(auth, email, password);
  return userCredential.user;
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

export const updateUserProfile = async (userId: string, updates: Partial<UserProfile>) => {
  const docRef = doc(db, 'users', userId);
  await setDoc(docRef, {
    ...updates,
    updated_at: Timestamp.now()
  }, { merge: true });
};

export const onAuthChange = (callback: (user: User | null) => void) => {
  return onAuthStateChanged(auth, callback);
};

export const uploadProfilePicture = async (userId: string, file: File): Promise<string> => {
  const fileExtension = file.name.split('.').pop();
  const fileName = `${userId}_${Date.now()}.${fileExtension}`;
  const storageRef = ref(storage, `profile-pictures/${fileName}`);

  await uploadBytes(storageRef, file);
  const downloadURL = await getDownloadURL(storageRef);

  return downloadURL;
};
