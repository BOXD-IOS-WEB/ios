import {
  collection,
  doc,
  addDoc,
  deleteDoc,
  getDocs,
  query,
  where,
  orderBy,
  Timestamp,
  updateDoc,
  increment
} from 'firebase/firestore';
import { db, auth } from '@/lib/firebase';

export interface Comment {
  id?: string;
  raceLogId: string;
  userId: string;
  username: string;
  userAvatar?: string;
  content: string;
  createdAt: Date;
  likesCount: number;
  likedBy: string[];
}

const commentsCollection = collection(db, 'comments');

export const addComment = async (raceLogId: string, content: string) => {
  const user = auth.currentUser;
  if (!user) throw new Error('User not authenticated');

  const newComment = {
    raceLogId,
    userId: user.uid,
    username: user.displayName || user.email?.split('@')[0] || 'User',
    userAvatar: user.photoURL || '',
    content,
    createdAt: Timestamp.now(),
    likesCount: 0,
    likedBy: []
  };

  const docRef = await addDoc(commentsCollection, newComment);

  await updateDoc(doc(db, 'raceLogs', raceLogId), {
    commentsCount: increment(1)
  });

  return docRef.id;
};

export const deleteComment = async (commentId: string, raceLogId: string) => {
  const user = auth.currentUser;
  if (!user) throw new Error('User not authenticated');

  await deleteDoc(doc(db, 'comments', commentId));

  await updateDoc(doc(db, 'raceLogs', raceLogId), {
    commentsCount: increment(-1)
  });
};

export const getComments = async (raceLogId: string) => {
  const q = query(
    commentsCollection,
    where('raceLogId', '==', raceLogId),
    orderBy('createdAt', 'desc')
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Comment));
};

export const toggleCommentLike = async (commentId: string) => {
  const user = auth.currentUser;
  if (!user) throw new Error('User not authenticated');

  const commentRef = doc(db, 'comments', commentId);
  const commentDoc = await getDocs(query(commentsCollection, where('__name__', '==', commentId)));

  if (commentDoc.empty) throw new Error('Comment not found');

  const comment = commentDoc.docs[0].data() as Comment;
  const likedBy = comment.likedBy || [];
  const isLiked = likedBy.includes(user.uid);

  if (isLiked) {
    await updateDoc(commentRef, {
      likedBy: likedBy.filter(id => id !== user.uid),
      likesCount: increment(-1)
    });
    return false;
  } else {
    await updateDoc(commentRef, {
      likedBy: [...likedBy, user.uid],
      likesCount: increment(1)
    });
    return true;
  }
};
