import { getCurrentUser } from '@/lib/auth-native';
import {
  addDocument,
  getDocuments,
  deleteDocument,
  Timestamp,
  timestampToDate
} from '@/lib/firestore-native';

export interface WatchlistItem {
  id?: string;
  userId: string;
  raceYear: number;
  raceName: string;
  raceLocation: string;
  raceDate: Date;
  countryCode?: string;
  notes: string;
  reminderEnabled: boolean;
  createdAt: Date;
}

export const addToWatchlist = async (item: Omit<WatchlistItem, 'id' | 'createdAt'>) => {
  const user = await getCurrentUser();
  if (!user) throw new Error('User not authenticated');

  console.log('[Watchlist] Adding item to watchlist:', {
    raceName: item.raceName,
    raceYear: item.raceYear,
    raceDate: item.raceDate,
  });

  const newItem = {
    ...item,
    userId: user.uid,
    raceDate: item.raceDate instanceof Date ? Timestamp.fromDate(item.raceDate) : item.raceDate,
    createdAt: Timestamp.now()
  };

  const docId = await addDocument('watchlist', newItem);
  console.log('[Watchlist] Item added with ID:', docId);
  return docId;
};

export const getUserWatchlist = async (userId: string) => {
  try {
    console.log('[Watchlist] Fetching watchlist for userId:', userId);
    const docs = await getDocuments('watchlist', {
      where: [{ field: 'userId', operator: '==', value: userId }],
      orderBy: { field: 'raceDate', direction: 'asc' }
    });
    console.log('[Watchlist] Found', docs.length, 'items');

    return docs.map(doc => ({
      ...doc,
      raceDate: timestampToDate(doc.raceDate),
      createdAt: timestampToDate(doc.createdAt)
    })) as WatchlistItem[];
  } catch (error) {
    console.error('[Watchlist] Error fetching watchlist:', error);
    throw error;
  }
};

export const removeFromWatchlist = async (itemId: string) => {
  await deleteDocument(`watchlist/${itemId}`);
};
