import {
  collection,
  doc,
  addDoc,
  deleteDoc,
  getDocs,
  query,
  where,
  Timestamp,
  updateDoc,
  increment
} from 'firebase/firestore';
import { db, auth } from '@/lib/firebase';
import { createActivity } from './activity';

export interface Follow {
  id?: string;
  followerId: string;
  followingId: string;
  createdAt: Date;
}

const followsCollection = collection(db, 'follows');

export const followUser = async (userIdToFollow: string) => {
  const user = auth.currentUser;
  if (!user) throw new Error('User not authenticated');
  if (user.uid === userIdToFollow) throw new Error('Cannot follow yourself');

  const existingFollow = await query(
    followsCollection,
    where('followerId', '==', user.uid),
    where('followingId', '==', userIdToFollow)
  );
  const snapshot = await getDocs(existingFollow);

  if (!snapshot.empty) {
    throw new Error('Already following this user');
  }

  await addDoc(followsCollection, {
    followerId: user.uid,
    followingId: userIdToFollow,
    createdAt: Timestamp.now()
  });

  await updateDoc(doc(db, 'userStats', userIdToFollow), {
    followersCount: increment(1)
  });

  await updateDoc(doc(db, 'userStats', user.uid), {
    followingCount: increment(1)
  });

  try {
    await createActivity({
      type: 'follow',
      targetId: userIdToFollow,
      targetType: 'user',
    });
  } catch (error) {
    console.error('Failed to create activity:', error);
  }
};

export const unfollowUser = async (userIdToUnfollow: string) => {
  const user = auth.currentUser;
  if (!user) throw new Error('User not authenticated');

  const q = query(
    followsCollection,
    where('followerId', '==', user.uid),
    where('followingId', '==', userIdToUnfollow)
  );
  const snapshot = await getDocs(q);

  if (snapshot.empty) {
    throw new Error('Not following this user');
  }

  await deleteDoc(doc(db, 'follows', snapshot.docs[0].id));

  await updateDoc(doc(db, 'userStats', userIdToUnfollow), {
    followersCount: increment(-1)
  });

  await updateDoc(doc(db, 'userStats', user.uid), {
    followingCount: increment(-1)
  });
};

export const isFollowing = async (userId: string): Promise<boolean> => {
  const user = auth.currentUser;
  if (!user) return false;

  const q = query(
    followsCollection,
    where('followerId', '==', user.uid),
    where('followingId', '==', userId)
  );
  const snapshot = await getDocs(q);
  return !snapshot.empty;
};

export const getFollowers = async (userId: string) => {
  const q = query(followsCollection, where('followingId', '==', userId));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Follow));
};

export const getFollowing = async (userId: string) => {
  const q = query(followsCollection, where('followerId', '==', userId));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Follow));
};
