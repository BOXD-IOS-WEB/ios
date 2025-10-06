import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  limit,
  Timestamp,
  increment,
  setDoc
} from 'firebase/firestore';
import { db, auth } from '@/lib/firebase';

export interface RaceLog {
  id?: string;
  userId: string;
  username: string;
  userAvatar?: string;
  raceYear: number;
  raceName: string;
  raceLocation: string;
  round?: number;
  countryCode?: string;
  dateWatched: Date;
  sessionType: 'race' | 'sprint' | 'qualifying' | 'highlights';
  watchMode: 'live' | 'replay' | 'tvBroadcast' | 'highlights' | 'attendedInPerson';
  rating: number;
  review: string;
  tags: string[];
  companions: string[];
  mediaUrls: string[];
  spoilerWarning: boolean;
  visibility: 'public' | 'private' | 'friends';
  addToLists?: string[];
  createdAt: Date;
  updatedAt: Date;
  likesCount: number;
  commentsCount: number;
  likedBy: string[];
}

const raceLogsCollection = collection(db, 'raceLogs');

const updateUserStats = async (userId: string) => {
  // Get all user's race logs
  const userLogs = await getUserRaceLogs(userId);

  // Calculate stats
  const racesWatched = userLogs.length;
  const reviewsCount = userLogs.filter(log => log.review && log.review.length > 0).length;
  const totalHoursWatched = calculateTotalHoursWatched(userLogs);

  // Update userStats document
  const userStatsRef = doc(db, 'userStats', userId);
  await setDoc(userStatsRef, {
    racesWatched,
    reviewsCount,
    totalHoursWatched
  }, { merge: true });
};

export const createRaceLog = async (raceLog: Omit<RaceLog, 'id' | 'createdAt' | 'updatedAt' | 'likesCount' | 'commentsCount' | 'likedBy'>) => {
  const user = auth.currentUser;
  if (!user) throw new Error('User not authenticated');

  const newLog = {
    ...raceLog,
    userId: user.uid,
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
    likesCount: 0,
    commentsCount: 0,
    likedBy: []
  };

  const docRef = await addDoc(raceLogsCollection, newLog);

  // Update user stats
  await updateUserStats(user.uid);

  return docRef.id;
};

export const getUserRaceLogs = async (userId: string) => {
  const q = query(
    raceLogsCollection,
    where('userId', '==', userId),
    orderBy('createdAt', 'desc')
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as RaceLog));
};

export const getPublicRaceLogs = async (limitCount: number = 20) => {
  const q = query(
    raceLogsCollection,
    where('visibility', '==', 'public'),
    orderBy('createdAt', 'desc'),
    limit(limitCount)
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as RaceLog));
};

export const getRaceLogById = async (logId: string) => {
  const docRef = doc(db, 'raceLogs', logId);
  const docSnap = await getDoc(docRef);
  if (docSnap.exists()) {
    return { id: docSnap.id, ...docSnap.data() } as RaceLog;
  }
  return null;
};

export const updateRaceLog = async (logId: string, updates: Partial<RaceLog>) => {
  const user = auth.currentUser;
  if (!user) throw new Error('User not authenticated');

  const docRef = doc(db, 'raceLogs', logId);
  await updateDoc(docRef, {
    ...updates,
    updatedAt: Timestamp.now()
  });

  // Update user stats
  await updateUserStats(user.uid);
};

export const deleteRaceLog = async (logId: string) => {
  const user = auth.currentUser;
  if (!user) throw new Error('User not authenticated');

  const docRef = doc(db, 'raceLogs', logId);
  await deleteDoc(docRef);

  // Update user stats
  await updateUserStats(user.uid);
};

export const getRaceLogsByYear = async (year: number) => {
  const q = query(
    raceLogsCollection,
    where('raceYear', '==', year),
    where('visibility', '==', 'public'),
    orderBy('createdAt', 'desc')
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as RaceLog));
};

export const getRaceLogsByTag = async (tag: string) => {
  const q = query(
    raceLogsCollection,
    where('tags', 'array-contains', tag),
    where('visibility', '==', 'public'),
    orderBy('createdAt', 'desc')
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as RaceLog));
};

export const calculateTotalHoursWatched = (logs: RaceLog[]): number => {
  return logs.reduce((total, log) => {
    let hours = 0;
    switch (log.sessionType) {
      case 'race':
        hours = 2;
        break;
      case 'sprint':
        hours = 0.5;
        break;
      case 'qualifying':
        hours = 1;
        break;
      case 'highlights':
        hours = 0.25;
        break;
    }
    return total + hours;
  }, 0);
};

export const getUserProfile = async (userId: string) => {
  const userDoc = await getDoc(doc(db, 'users', userId));
  return userDoc.exists() ? { id: userDoc.id, ...userDoc.data() } : null;
};
