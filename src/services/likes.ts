import {
  collection,
  doc,
  addDoc,
  deleteDoc,
  getDocs,
  getDoc,
  query,
  where,
  Timestamp,
  updateDoc,
  increment
} from 'firebase/firestore';
import { db, auth } from '@/lib/firebase';
import { createActivity } from './activity';

export interface Like {
  id?: string;
  userId: string;
  raceLogId: string;
  createdAt: Date;
}

const likesCollection = collection(db, 'likes');

export const toggleLike = async (raceLogId: string) => {
  const user = auth.currentUser;
  if (!user) throw new Error('User not authenticated');

  const q = query(
    likesCollection,
    where('userId', '==', user.uid),
    where('raceLogId', '==', raceLogId)
  );

  const snapshot = await getDocs(q);
  const raceLogRef = doc(db, 'raceLogs', raceLogId);

  if (snapshot.empty) {
    const newLike = {
      userId: user.uid,
      raceLogId,
      createdAt: Timestamp.now()
    };
    await addDoc(likesCollection, newLike);

    const raceLogDoc = await getDoc(raceLogRef);
    if (raceLogDoc.exists()) {
      const likedBy = raceLogDoc.data().likedBy || [];
      await updateDoc(raceLogRef, {
        likedBy: [...likedBy, user.uid],
        likesCount: increment(1)
      });

      try {
        await createActivity({
          type: 'like',
          targetId: raceLogId,
          targetType: 'raceLog',
        });
      } catch (error) {
        console.error('Failed to create activity:', error);
      }
    }

    return true;
  } else {
    const likeDoc = snapshot.docs[0];
    await deleteDoc(doc(db, 'likes', likeDoc.id));

    const raceLogDoc = await getDoc(raceLogRef);
    if (raceLogDoc.exists()) {
      const likedBy = raceLogDoc.data().likedBy || [];
      await updateDoc(raceLogRef, {
        likedBy: likedBy.filter((id: string) => id !== user.uid),
        likesCount: increment(-1)
      });
    }

    return false;
  }
};

export const getRaceLogLikes = async (raceLogId: string) => {
  const q = query(likesCollection, where('raceLogId', '==', raceLogId));
  const snapshot = await getDocs(q);
  return snapshot.size;
};

export const hasUserLiked = async (raceLogId: string, userId: string) => {
  const q = query(
    likesCollection,
    where('userId', '==', userId),
    where('raceLogId', '==', raceLogId)
  );
  const snapshot = await getDocs(q);
  return !snapshot.empty;
};
