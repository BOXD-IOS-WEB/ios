import {
  collection,
  addDoc,
  getDocs,
  query,
  where,
  orderBy,
  limit,
  Timestamp
} from 'firebase/firestore';
import { db, auth } from '@/lib/firebase';
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

const activitiesCollection = collection(db, 'activities');

export const createActivity = async (activity: Omit<Activity, 'id' | 'createdAt' | 'userId' | 'username' | 'userAvatar'>) => {
  const user = auth.currentUser;
  if (!user) throw new Error('User not authenticated');

  const newActivity = {
    ...activity,
    userId: user.uid,
    username: user.displayName || user.email?.split('@')[0] || 'User',
    userAvatar: user.photoURL || '',
    createdAt: Timestamp.now()
  };

  const docRef = await addDoc(activitiesCollection, newActivity);
  return docRef.id;
};

export const getUserActivity = async (userId: string, limitCount: number = 20) => {
  const q = query(
    activitiesCollection,
    where('userId', '==', userId),
    orderBy('createdAt', 'desc'),
    limit(limitCount)
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Activity));
};

export const getFollowingActivity = async (limitCount: number = 50) => {
  const user = auth.currentUser;
  if (!user) throw new Error('User not authenticated');

  const following = await getFollowing(user.uid);
  const followingIds = following.map(f => f.followingId);

  if (followingIds.length === 0) {
    return [];
  }

  const q = query(
    activitiesCollection,
    where('userId', 'in', followingIds.slice(0, 10)),
    orderBy('createdAt', 'desc'),
    limit(limitCount)
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Activity));
};

export const getGlobalActivity = async (limitCount: number = 50) => {
  const q = query(
    activitiesCollection,
    orderBy('createdAt', 'desc'),
    limit(limitCount)
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Activity));
};
