import { getCurrentUser } from '@/lib/auth-native';
import {
  getDocument,
  getDocuments,
  addDocument,
  updateDocument,
  deleteDocument,
  Timestamp,
  increment
} from '@/lib/firestore-native';
import { createActivity } from './activity';
import { createNotification } from './notifications';

export interface Like {
  id?: string;
  userId: string;
  raceLogId: string;
  createdAt: Date;
}

export const toggleLike = async (raceLogId: string) => {
  const user = await getCurrentUser();
  if (!user) throw new Error('User not authenticated');

  console.log('[toggleLike] Toggling like for raceLogId:', raceLogId, 'userId:', user.uid);

  const existingLikes = await getDocuments('likes', {
    where: [
      { field: 'userId', operator: '==', value: user.uid },
      { field: 'raceLogId', operator: '==', value: raceLogId }
    ]
  });

  if (existingLikes.length === 0) {
    // Add like
    console.log('[toggleLike] Adding like');
    const newLike = {
      userId: user.uid,
      raceLogId,
      createdAt: Timestamp.now()
    };
    await addDocument('likes', newLike);

    const raceLogData = await getDocument(`raceLogs/${raceLogId}`);
    if (raceLogData) {
      const likedBy = raceLogData.likedBy || [];

      // Only update if not already liked (prevent duplicates)
      if (!likedBy.includes(user.uid)) {
        await updateDocument(`raceLogs/${raceLogId}`, {
          likedBy: [...likedBy, user.uid],
          likesCount: increment(1)
        });
      }

      // Check if activity already exists for this user+raceLog combo
      const existingActivities = await getDocuments('activities', {
        where: [
          { field: 'userId', operator: '==', value: user.uid },
          { field: 'targetId', operator: '==', value: raceLogId },
          { field: 'type', operator: '==', value: 'like' }
        ]
      });

      // Only create activity if it doesn't exist
      if (existingActivities.length === 0) {
        try {
          console.log('[toggleLike] Creating like activity');
          await createActivity({
            type: 'like',
            targetId: raceLogId,
            targetType: 'raceLog',
          });
        } catch (error) {
          console.error('[toggleLike] Failed to create activity:', error);
        }
      } else {
        console.log('[toggleLike] Activity already exists, skipping creation');
      }

      // Create notification for the race log owner (only if not self-like)
      try {
        const raceLogOwnerId = raceLogData.userId;
        if (raceLogOwnerId && raceLogOwnerId !== user.uid) {
          const likerData = await getDocument(`users/${user.uid}`);
          const likerName = likerData?.name || user.displayName || user.email?.split('@')[0] || 'Someone';
          const likerPhoto = likerData?.photoURL || user.photoURL;
          const raceName = raceLogData.raceName || 'your race log';

          await createNotification({
            userId: raceLogOwnerId,
            type: 'like',
            actorId: user.uid,
            actorName: likerName,
            actorPhotoURL: likerPhoto,
            content: `liked your review of ${raceName}`,
            linkTo: `/race/${raceLogId}`,
          });
          console.log('[toggleLike] Notification created for like');
        }
      } catch (error) {
        console.error('[toggleLike] Failed to create notification:', error);
      }
    }

    return true;
  } else {
    // Remove like
    console.log('[toggleLike] Removing like');
    const likeDoc = existingLikes[0];
    await deleteDocument(`likes/${likeDoc.id}`);

    const raceLogData = await getDocument(`raceLogs/${raceLogId}`);
    if (raceLogData) {
      const likedBy = raceLogData.likedBy || [];
      await updateDocument(`raceLogs/${raceLogId}`, {
        likedBy: likedBy.filter((id: string) => id !== user.uid),
        likesCount: increment(-1)
      });
    }

    // Delete the like activity when unliking
    try {
      console.log('[toggleLike] Deleting like activity');
      const activities = await getDocuments('activities', {
        where: [
          { field: 'userId', operator: '==', value: user.uid },
          { field: 'targetId', operator: '==', value: raceLogId },
          { field: 'type', operator: '==', value: 'like' }
        ]
      });

      for (const activity of activities) {
        if (activity.id) {
          await deleteDocument(`activities/${activity.id}`);
          console.log('[toggleLike] Deleted activity:', activity.id);
        }
      }
    } catch (error) {
      console.error('[toggleLike] Failed to delete activity:', error);
    }

    return false;
  }
};

export const getRaceLogLikes = async (raceLogId: string) => {
  const likes = await getDocuments('likes', {
    where: [{ field: 'raceLogId', operator: '==', value: raceLogId }]
  });
  return likes.length;
};

export const hasUserLiked = async (raceLogId: string, userId: string) => {
  const likes = await getDocuments('likes', {
    where: [
      { field: 'userId', operator: '==', value: userId },
      { field: 'raceLogId', operator: '==', value: raceLogId }
    ]
  });
  return likes.length > 0;
};
