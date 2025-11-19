import {
  getDocuments,
  timestampToDate
} from '@/lib/firestore-native';

export interface Activity {
  id?: string;
  userId: string;
  username: string;
  userProfileImageUrl: string;
  type: 'raceLog' | 'review' | 'listCreated' | 'listUpdated' | 'like' | 'follow' | 'comment';
  targetId: string;
  targetTitle: string;
  content: string;
  metadata: Record<string, any>;
  createdAt: Date;
  likesCount: number;
  commentsCount: number;
}

export const getUserActivities = async (userId: string, limitCount: number = 20) => {
  const docs = await getDocuments('activities', {
    where: [{ field: 'userId', operator: '==', value: userId }],
    orderBy: { field: 'createdAt', direction: 'desc' },
    limit: limitCount
  });
  return docs.map(doc => ({
    ...doc,
    createdAt: timestampToDate(doc.createdAt)
  })) as Activity[];
};

export const getFollowingActivities = async (userIds: string[], limitCount: number = 20) => {
  if (userIds.length === 0) return [];

  // Take only first 10 users due to Firestore 'in' query limitation
  const limitedUserIds = userIds.slice(0, 10);

  // Since native plugin might not support 'in' operator, fetch for each user separately
  const allActivities = await Promise.all(
    limitedUserIds.map(async (userId) => {
      const docs = await getDocuments('activities', {
        where: [{ field: 'userId', operator: '==', value: userId }],
        orderBy: { field: 'createdAt', direction: 'desc' },
        limit: 5
      });
      return docs.map(doc => ({
        ...doc,
        createdAt: timestampToDate(doc.createdAt)
      })) as Activity[];
    })
  );

  // Flatten and sort by createdAt
  const flattened = allActivities.flat();
  flattened.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

  return flattened.slice(0, limitCount);
};
