import { getCurrentUser } from '@/lib/auth-native';
import {
  getDocuments,
  addDocument,
  updateDocument,
  Timestamp,
  timestampToDate
} from '@/lib/firestore-native';

export interface Notification {
  id?: string;
  userId: string; // recipient
  type: 'like' | 'comment' | 'follow' | 'mention';
  actorId: string; // who performed the action
  actorName: string;
  actorPhotoURL?: string;
  content: string; // e.g., "liked your review" or "started following you"
  linkTo?: string; // URL to navigate to
  isRead: boolean;
  createdAt: Date;
}

export const createNotification = async (notification: Omit<Notification, 'id' | 'createdAt' | 'isRead'>) => {
  const user = await getCurrentUser();
  if (!user) throw new Error('User not authenticated');

  // Don't create notification if actor is the same as recipient
  if (notification.actorId === notification.userId) return;

  // Check for duplicate notifications (same type, actor, user, and link within last 24 hours)
  try {
    const existingNotifications = await getDocuments('notifications', {
      where: [
        { field: 'userId', operator: '==', value: notification.userId },
        { field: 'actorId', operator: '==', value: notification.actorId },
        { field: 'type', operator: '==', value: notification.type },
      ]
    });

    // Check if there's a recent notification (within 24 hours) with the same linkTo
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const duplicateExists = existingNotifications.some(existing => {
      const existingDate = timestampToDate(existing.createdAt);
      const isSameLink = existing.linkTo === notification.linkTo;
      const isRecent = existingDate > oneDayAgo;
      return isSameLink && isRecent;
    });

    if (duplicateExists) {
      console.log('[Notifications] Duplicate notification detected, skipping creation');
      return;
    }
  } catch (error) {
    console.error('[Notifications] Error checking for duplicates:', error);
    // Continue to create notification even if duplicate check fails
  }

  const newNotification = {
    ...notification,
    isRead: false,
    createdAt: Timestamp.now(),
  };

  await addDocument('notifications', newNotification);
};

export const getUserNotifications = async (userId: string, limitCount: number = 20) => {
  try {
    const docs = await getDocuments('notifications', {
      where: [{ field: 'userId', operator: '==', value: userId }],
      orderBy: { field: 'createdAt', direction: 'desc' },
      limit: limitCount
    });

    return docs.map(doc => ({
      ...doc,
      createdAt: timestampToDate(doc.createdAt)
    })) as Notification[];
  } catch (error: any) {
    console.error('[Notifications] Error fetching notifications:', error);
    if (error.code === 'permission-denied') {
      console.error('[Notifications] Permission denied for userId:', userId);
    }
    return [];
  }
};

export const getUnreadNotificationsCount = async (userId: string) => {
  try {
    const docs = await getDocuments('notifications', {
      where: [
        { field: 'userId', operator: '==', value: userId },
        { field: 'isRead', operator: '==', value: false }
      ]
    });

    return docs.length;
  } catch (error: any) {
    console.error('[Notifications] Error fetching unread count:', error);
    if (error.code === 'permission-denied') {
      console.error('[Notifications] Permission denied for userId:', userId);
    }
    return 0;
  }
};

export const markNotificationAsRead = async (notificationId: string) => {
  await updateDocument(`notifications/${notificationId}`, {
    isRead: true
  });
};

export const markAllNotificationsAsRead = async (userId: string) => {
  const unreadDocs = await getDocuments('notifications', {
    where: [
      { field: 'userId', operator: '==', value: userId },
      { field: 'isRead', operator: '==', value: false }
    ]
  });

  const updatePromises = unreadDocs.map(doc =>
    updateDocument(`notifications/${doc.id}`, { isRead: true })
  );

  await Promise.all(updatePromises);
};
