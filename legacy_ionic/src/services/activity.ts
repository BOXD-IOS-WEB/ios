import { getCurrentUser } from '@/lib/auth-native';
import {
  getDocument,
  getDocuments,
  addDocument,
  Timestamp,
  timestampToDate
} from '@/lib/firestore-native';
import { getFollowing } from './follows';

export interface Activity {
  id?: string;
  userId: string;
  username: string;
  userAvatar?: string;
  type: 'log' | 'review' | 'like' | 'list' | 'follow';
  targetId: string;
  targetType: 'raceLog' | 'list' | 'user';
  content?: string;
  createdAt: Date;
}

export const createActivity = async (activity: Omit<Activity, 'id' | 'createdAt' | 'userId' | 'username' | 'userAvatar'>) => {
  const user = await getCurrentUser();
  if (!user) throw new Error('User not authenticated');

  // Fetch user's profile from Firestore to get the latest photoURL
  let userAvatar = user.photoURL || '';
  let username = user.displayName || user.email?.split('@')[0] || 'User';

  try {
    const userData = await getDocument(`users/${user.uid}`);
    if (userData) {
      userAvatar = userData.photoURL || user.photoURL || '';
      username = userData.name || username;
    }
  } catch (error) {
    console.error('Error fetching user profile for activity:', error);
  }

  const newActivity = {
    ...activity,
    userId: user.uid,
    username,
    userAvatar,
    createdAt: Timestamp.now()
  };

  const docId = await addDocument('activities', newActivity);
  return docId;
};

export const getUserActivity = async (userId: string, limitCount: number = 20) => {
  const docs = await getDocuments('activities', {
    where: [{ field: 'userId', operator: '==', value: userId }],
    orderBy: { field: 'createdAt', direction: 'desc' },
    limit: limitCount
  });

  // Fetch user profile once for this user
  let userAvatar = '';
  let username = 'User';

  try {
    const userData = await getDocument(`users/${userId}`);
    if (userData) {
      userAvatar = userData.photoURL || '';
      username = userData.name || username;
    }
  } catch (error) {
    console.error('Error fetching user profile:', error);
  }

  return docs.map(doc => ({
    ...doc,
    username: doc.username || username,
    userAvatar: doc.userAvatar || userAvatar,
    createdAt: timestampToDate(doc.createdAt)
  })) as Activity[];
};

export const getFollowingActivity = async (limitCount: number = 50) => {
  const user = await getCurrentUser();
  if (!user) throw new Error('User not authenticated');

  const following = await getFollowing(user.uid);
  const followingIds = following.map((f: any) => f.id).filter(id => id !== undefined && id !== null);

  if (followingIds.length === 0) {
    return [];
  }

  // Firestore 'in' queries are limited to 10 items, so we need to batch queries
  const batchSize = 10;
  const batches: Activity[][] = [];

  for (let i = 0; i < followingIds.length; i += batchSize) {
    const batch = followingIds.slice(i, i + batchSize).filter(id => id !== undefined && id !== null);

    // Skip empty batches
    if (batch.length === 0) continue;

    // Note: Native plugin doesn't support 'in' operator yet, so we'll fetch for each user
    // This is less efficient but works for now
    const batchActivities = await Promise.all(
      batch.map(async (userId) => {
        const docs = await getDocuments('activities', {
          where: [{ field: 'userId', operator: '==', value: userId }],
          orderBy: { field: 'createdAt', direction: 'desc' },
          limit: 20
        });
        return docs.map(doc => ({
          ...doc,
          createdAt: timestampToDate(doc.createdAt)
        })) as Activity[];
      })
    );

    batches.push(batchActivities.flat());
  }

  // Combine all batches and sort by createdAt
  const allActivities = batches.flat();
  allActivities.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

  // Return only the requested limit
  return allActivities.slice(0, limitCount);
};

export const getGlobalActivity = async (limitCount: number = 50) => {
  try {
    const docs = await getDocuments('activities', {
      orderBy: { field: 'createdAt', direction: 'desc' },
      limit: limitCount
    });

    // Fetch user profiles for activities missing userAvatar
    const activities = await Promise.all(
      docs.map(async (doc) => {
        let userAvatar = doc.userAvatar || '';
        let username = doc.username || 'User';

        // If userAvatar is missing or empty, fetch from users collection
        if (!userAvatar && doc.userId) {
          try {
            const userData = await getDocument(`users/${doc.userId}`);
            if (userData) {
              userAvatar = userData.photoURL || '';
              username = userData.name || username;
            }
          } catch (error) {
            console.error('Error fetching user profile for activity:', error);
          }
        }

        return {
          ...doc,
          username,
          userAvatar,
          createdAt: timestampToDate(doc.createdAt)
        } as Activity;
      })
    );

    return activities;
  } catch (error) {
    console.error('[getGlobalActivity] Error:', error);
    return [];
  }
};
