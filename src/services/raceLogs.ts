import { getCurrentUser } from '@/lib/auth-native';
import {
  getDocument,
  setDocument,
  getDocuments,
  addDocument,
  updateDocument,
  deleteDocument,
  Timestamp,
  increment,
  timestampToDate
} from '@/lib/firestore-native';

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
  sessionType: 'race' | 'sprint' | 'qualifying' | 'sprintQualifying' | 'highlights';
  watchMode: 'live' | 'replay' | 'tvBroadcast' | 'highlights' | 'attendedInPerson';
  rating: number;
  review: string;
  tags: string[];
  companions: string[];
  driverOfTheDay?: string;
  raceWinner?: string;
  mediaUrls: string[];
  spoilerWarning: boolean;
  hasSpoilers?: boolean;
  visibility: 'public' | 'private' | 'friends';
  addToLists?: string[];
  createdAt: Date;
  updatedAt: Date;
  likesCount: number;
  commentsCount: number;
  likedBy: string[];
}

const updateUserStats = async (userId: string) => {
  // Get all user's race logs
  const userLogs = await getUserRaceLogs(userId);

  // Calculate stats
  const racesWatched = userLogs.length;
  const reviewsCount = userLogs.filter(log => log.review && log.review.length > 0).length;
  const totalHoursWatched = calculateTotalHoursWatched(userLogs);

  // Update userStats document
  await setDocument(`userStats/${userId}`, {
    racesWatched,
    reviewsCount,
    totalHoursWatched
  }, true);
};

export const createRaceLog = async (raceLog: Omit<RaceLog, 'id' | 'createdAt' | 'updatedAt' | 'likesCount' | 'commentsCount' | 'likedBy'>) => {
  const user = await getCurrentUser();
  if (!user) throw new Error('User not authenticated');

  try {
    console.log('[createRaceLog] Creating new race log for user:', user.uid);
    console.log('[createRaceLog] Race data:', {
      raceName: raceLog.raceName,
      raceYear: raceLog.raceYear,
      dateWatched: raceLog.dateWatched,
      rating: raceLog.rating,
    });

    // Fetch user's profile from Firestore to get the latest photoURL and username
    let userAvatar = user.photoURL || '';
    let username = raceLog.username || user.displayName || user.email?.split('@')[0] || 'User';

    try {
      const userData = await getDocument(`users/${user.uid}`);
      if (userData) {
        userAvatar = userData.photoURL || user.photoURL || '';
        username = userData.name || username;
      }
    } catch (error) {
      console.error('Error fetching user profile for race log:', error);
    }

    // Convert Date to Timestamp if needed
    const dateWatchedTimestamp = raceLog.dateWatched instanceof Date
      ? Timestamp.fromDate(raceLog.dateWatched)
      : raceLog.dateWatched;

    const newLog = {
      ...raceLog,
      username,
      userAvatar,
      dateWatched: dateWatchedTimestamp,
      userId: user.uid,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
      likesCount: 0,
      commentsCount: 0,
      likedBy: []
    };

    const docId = await addDocument('raceLogs', newLog);
    console.log('[createRaceLog] Successfully created race log with ID:', docId);

    // Update user stats
    await updateUserStats(user.uid);

    return docId;
  } catch (error) {
    console.error('[createRaceLog] Error creating race log:', error);
    console.error('UserId:', user.uid, 'Race:', raceLog.raceName);
    throw new Error('Failed to create race log: ' + (error instanceof Error ? error.message : 'Unknown error'));
  }
};

export const getUserRaceLogs = async (userId: string) => {
  try {
    const docs = await getDocuments('raceLogs', {
      where: [{ field: 'userId', operator: '==', value: userId }],
      orderBy: { field: 'createdAt', direction: 'desc' }
    });
    return docs.map(doc => {
      // Convert Firestore Timestamps to Date objects
      return {
        ...doc,
        dateWatched: timestampToDate(doc.dateWatched),
        createdAt: timestampToDate(doc.createdAt),
        updatedAt: timestampToDate(doc.updatedAt),
      } as RaceLog;
    });
  } catch (error) {
    console.error('Error fetching user race logs:', error);
    console.error('UserId:', userId);
    throw new Error('Failed to fetch race logs: ' + (error instanceof Error ? error.message : 'Unknown error'));
  }
};

export const getPublicRaceLogs = async (limitCount: number = 20) => {
  try {
    console.log('[getPublicRaceLogs] Fetching public race logs, limit:', limitCount);
    console.log('[getPublicRaceLogs] Fetching from Firestore...');

    const docs = await getDocuments('raceLogs', {
      where: [{ field: 'visibility', operator: '==', value: 'public' }],
      orderBy: { field: 'createdAt', direction: 'desc' },
      limit: limitCount
    });
    console.log('[getPublicRaceLogs] Fetched', docs.length, 'documents');
    const logs = docs.map(doc => {
      // Convert Firestore Timestamps to Date objects
      return {
        ...doc,
        dateWatched: timestampToDate(doc.dateWatched),
        createdAt: timestampToDate(doc.createdAt),
        updatedAt: timestampToDate(doc.updatedAt),
      } as RaceLog;
    });
    console.log('[getPublicRaceLogs] Returning', logs.length, 'race logs');
    return logs;
  } catch (error) {
    console.error('[getPublicRaceLogs] Error fetching public race logs:', error);
    console.error('[getPublicRaceLogs] Error details:', error instanceof Error ? error.message : 'Unknown error');
    throw new Error('Failed to fetch public race logs: ' + (error instanceof Error ? error.message : 'Unknown error'));
  }
};

export const getRaceLogById = async (logId: string) => {
  try {
    const data = await getDocument(`raceLogs/${logId}`);
    if (data) {
      // Convert Firestore Timestamps to Date objects
      return {
        id: logId,
        ...data,
        dateWatched: timestampToDate(data.dateWatched),
        createdAt: timestampToDate(data.createdAt),
        updatedAt: timestampToDate(data.updatedAt),
      } as RaceLog;
    }
    return null;
  } catch (error) {
    console.error('Error fetching race log by ID:', error);
    console.error('LogId:', logId);
    throw new Error('Failed to fetch race log: ' + (error instanceof Error ? error.message : 'Unknown error'));
  }
};

export const updateRaceLog = async (logId: string, updates: Partial<RaceLog>) => {
  const user = await getCurrentUser();
  if (!user) throw new Error('User not authenticated');

  try {
    console.log('[updateRaceLog] Updating log:', logId, 'Updates:', updates);

    // Convert Date objects to Timestamps for Firestore
    const updatesToSave: any = { ...updates };
    if (updates.dateWatched) {
      updatesToSave.dateWatched = updates.dateWatched instanceof Date
        ? Timestamp.fromDate(updates.dateWatched)
        : updates.dateWatched;
    }

    await updateDocument(`raceLogs/${logId}`, {
      ...updatesToSave,
      updatedAt: Timestamp.now()
    });

    console.log('[updateRaceLog] Successfully updated race log');
    // Update user stats
    await updateUserStats(user.uid);
  } catch (error) {
    console.error('[updateRaceLog] Error updating race log:', error);
    console.error('LogId:', logId, 'UserId:', user.uid);
    throw new Error('Failed to update race log: ' + (error instanceof Error ? error.message : 'Unknown error'));
  }
};

export const deleteRaceLog = async (logId: string) => {
  const user = await getCurrentUser();
  if (!user) throw new Error('User not authenticated');

  try {
    console.log('[deleteRaceLog] Deleting log:', logId, 'UserId:', user.uid);
    await deleteDocument(`raceLogs/${logId}`);

    console.log('[deleteRaceLog] Successfully deleted race log');
    // Update user stats
    await updateUserStats(user.uid);
  } catch (error) {
    console.error('[deleteRaceLog] Error deleting race log:', error);
    console.error('LogId:', logId, 'UserId:', user.uid);
    throw new Error('Failed to delete race log: ' + (error instanceof Error ? error.message : 'Unknown error'));
  }
};

export const getRaceLogsByYear = async (year: number) => {
  try {
    const docs = await getDocuments('raceLogs', {
      where: [
        { field: 'raceYear', operator: '==', value: year },
        { field: 'visibility', operator: '==', value: 'public' }
      ],
      orderBy: { field: 'createdAt', direction: 'desc' }
    });
    return docs.map(doc => {
      // Convert Firestore Timestamps to Date objects
      return {
        ...doc,
        dateWatched: timestampToDate(doc.dateWatched),
        createdAt: timestampToDate(doc.createdAt),
        updatedAt: timestampToDate(doc.updatedAt),
      } as RaceLog;
    });
  } catch (error) {
    console.error('Error fetching race logs by year:', error);
    console.error('Year:', year);
    throw new Error('Failed to fetch race logs by year: ' + (error instanceof Error ? error.message : 'Unknown error'));
  }
};

export const getRaceLogsByTag = async (tag: string) => {
  try {
    const docs = await getDocuments('raceLogs', {
      where: [
        { field: 'tags', operator: 'array-contains', value: tag },
        { field: 'visibility', operator: '==', value: 'public' }
      ],
      orderBy: { field: 'createdAt', direction: 'desc' }
    });
    return docs.map(doc => {
      // Convert Firestore Timestamps to Date objects
      return {
        ...doc,
        dateWatched: timestampToDate(doc.dateWatched),
        createdAt: timestampToDate(doc.createdAt),
        updatedAt: timestampToDate(doc.updatedAt),
      } as RaceLog;
    });
  } catch (error) {
    console.error('Error fetching race logs by tag:', error);
    console.error('Tag:', tag);
    throw new Error('Failed to fetch race logs by tag: ' + (error instanceof Error ? error.message : 'Unknown error'));
  }
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
  const data = await getDocument(`users/${userId}`);
  return data ? { id: userId, ...data } : null;
};
