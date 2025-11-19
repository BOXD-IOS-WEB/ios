import { getCurrentUser } from '@/lib/auth-native';
import {
  getDocument,
  getDocuments,
  addDocument,
  updateDocument,
  deleteDocument,
  Timestamp,
  increment,
  timestampToDate
} from '@/lib/firestore-native';
import { createNotification } from './notifications';

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

export const addComment = async (raceLogId: string, content: string) => {
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
    console.error('Error fetching user profile for comment:', error);
  }

  const newComment = {
    raceLogId,
    userId: user.uid,
    username,
    userAvatar,
    content,
    createdAt: Timestamp.now(),
    likesCount: 0,
    likedBy: []
  };

  const docId = await addDocument('comments', newComment);

  await updateDocument(`raceLogs/${raceLogId}`, {
    commentsCount: increment(1)
  });

  // Create notification for the race log owner
  try {
    const raceLogData = await getDocument(`raceLogs/${raceLogId}`);
    if (raceLogData) {
      const raceLogOwnerId = raceLogData.userId;
      if (raceLogOwnerId && raceLogOwnerId !== user.uid) {
        const raceName = raceLogData.raceName || 'your race log';

        await createNotification({
          userId: raceLogOwnerId,
          type: 'comment',
          actorId: user.uid,
          actorName: username,
          actorPhotoURL: userAvatar,
          content: `commented on your review of ${raceName}`,
          linkTo: `/race/${raceLogId}`,
        });
        console.log('[addComment] Notification created for comment');
      }
    }
  } catch (error) {
    console.error('[addComment] Failed to create notification:', error);
  }

  return docId;
};

export const deleteComment = async (commentId: string, raceLogId: string) => {
  const user = await getCurrentUser();
  if (!user) throw new Error('User not authenticated');

  await deleteDocument(`comments/${commentId}`);

  await updateDocument(`raceLogs/${raceLogId}`, {
    commentsCount: increment(-1)
  });
};

export const getComments = async (raceLogId: string) => {
  const docs = await getDocuments('comments', {
    where: [{ field: 'raceLogId', operator: '==', value: raceLogId }],
    orderBy: { field: 'createdAt', direction: 'desc' }
  });
  return docs.map(doc => ({
    ...doc,
    createdAt: timestampToDate(doc.createdAt)
  })) as Comment[];
};

export const toggleCommentLike = async (commentId: string) => {
  const user = await getCurrentUser();
  if (!user) throw new Error('User not authenticated');

  const commentData = await getDocument(`comments/${commentId}`);
  if (!commentData) throw new Error('Comment not found');

  const likedBy = commentData.likedBy || [];
  const isLiked = likedBy.includes(user.uid);

  if (isLiked) {
    await updateDocument(`comments/${commentId}`, {
      likedBy: likedBy.filter((id: string) => id !== user.uid),
      likesCount: increment(-1)
    });
    return false;
  } else {
    await updateDocument(`comments/${commentId}`, {
      likedBy: [...likedBy, user.uid],
      likesCount: increment(1)
    });
    return true;
  }
};
