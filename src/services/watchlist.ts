import {
  collection,
  doc,
  addDoc,
  deleteDoc,
  getDocs,
  query,
  where,
  orderBy,
  Timestamp
} from 'firebase/firestore';
import { db, auth } from '@/lib/firebase';

export interface WatchlistItem {
  id?: string;
  userId: string;
  raceYear: number;
  raceName: string;
  raceLocation: string;
  raceDate: Date | Timestamp;
  notes: string;
  reminderEnabled: boolean;
  createdAt: Date | Timestamp;
}

const watchlistCollection = collection(db, 'watchlist');

export const addToWatchlist = async (item: Omit<WatchlistItem, 'id' | 'createdAt'>) => {
  const user = auth.currentUser;
  if (!user) throw new Error('User not authenticated');

  const newItem = {
    ...item,
    userId: user.uid,
    raceDate: item.raceDate instanceof Date ? Timestamp.fromDate(item.raceDate) : item.raceDate,
    createdAt: Timestamp.now()
  };

  const docRef = await addDoc(watchlistCollection, newItem);
  return docRef.id;
};

export const getUserWatchlist = async (userId: string) => {
  const q = query(
    watchlistCollection,
    where('userId', '==', userId),
    orderBy('raceDate', 'asc')
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as WatchlistItem));
};

export const removeFromWatchlist = async (itemId: string) => {
  const docRef = doc(db, 'watchlist', itemId);
  await deleteDoc(docRef);
};
