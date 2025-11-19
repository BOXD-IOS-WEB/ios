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

export interface Follow {
  id?: string;
  followerId: string;
  followingId: string;
  createdAt: Date;
}

export const followUser = async (userIdToFollow: string) => {
  const user = await getCurrentUser();
  if (!user) throw new Error('User not authenticated');
  if (user.uid === userIdToFollow) throw new Error('Cannot follow yourself');

  const existingFollow = await getDocuments('follows', {
    where: [
      { field: 'followerId', operator: '==', value: user.uid },
      { field: 'followingId', operator: '==', value: userIdToFollow }
    ]
  });

  if (existingFollow.length > 0) {
    throw new Error('Already following this user');
  }

  await addDocument('follows', {
    followerId: user.uid,
    followingId: userIdToFollow,
    createdAt: Timestamp.now()
  });

  await updateDocument(`userStats/${userIdToFollow}`, {
    followersCount: increment(1)
  });

  await updateDocument(`userStats/${user.uid}`, {
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

  // Create notification for the followed user
  try {
    const followerData = await getDocument(`users/${user.uid}`);
    const followerName = followerData?.name || user.displayName || user.email?.split('@')[0] || 'Someone';
    const followerPhoto = followerData?.photoURL || user.photoURL;

    await createNotification({
      userId: userIdToFollow,
      type: 'follow',
      actorId: user.uid,
      actorName: followerName,
      actorPhotoURL: followerPhoto,
      content: 'started following you',
      linkTo: `/user/${user.uid}`,
    });
    console.log('[followUser] Notification created for follow');
  } catch (error) {
    console.error('[followUser] Failed to create notification:', error);
  }
};

export const unfollowUser = async (userIdToUnfollow: string) => {
  const user = await getCurrentUser();
  if (!user) throw new Error('User not authenticated');

  const follows = await getDocuments('follows', {
    where: [
      { field: 'followerId', operator: '==', value: user.uid },
      { field: 'followingId', operator: '==', value: userIdToUnfollow }
    ]
  });

  if (follows.length === 0) {
    throw new Error('Not following this user');
  }

  await deleteDocument(`follows/${follows[0].id}`);

  await updateDocument(`userStats/${userIdToUnfollow}`, {
    followersCount: increment(-1)
  });

  await updateDocument(`userStats/${user.uid}`, {
    followingCount: increment(-1)
  });
};

export const isFollowing = async (userId: string): Promise<boolean> => {
  const user = await getCurrentUser();
  if (!user) return false;

  const follows = await getDocuments('follows', {
    where: [
      { field: 'followerId', operator: '==', value: user.uid },
      { field: 'followingId', operator: '==', value: userId }
    ]
  });
  return follows.length > 0;
};

export const getFollowers = async (userId: string) => {
  console.log('[getFollowers] Fetching followers for user:', userId);
  const follows = await getDocuments('follows', {
    where: [{ field: 'followingId', operator: '==', value: userId }]
  });

  console.log('[getFollowers] Found', follows.length, 'follow documents');

  // Get the actual user data for each follower - deduplicate first
  const followerIds = [...new Set(follows.map(f => f.followerId))];
  console.log('[getFollowers] Unique follower IDs:', followerIds.length);

  const followers = await Promise.all(
    followerIds.map(async (followerId) => {
      const userData = await getDocument(`users/${followerId}`);
      if (userData) {
        return { id: followerId, ...userData };
      }
      return null;
    })
  );

  const validFollowers = followers.filter(f => f !== null);
  console.log('[getFollowers] Returning', validFollowers.length, 'valid followers');
  return validFollowers;
};

export const getFollowing = async (userId: string) => {
  console.log('[getFollowing] Fetching following for user:', userId);
  const follows = await getDocuments('follows', {
    where: [{ field: 'followerId', operator: '==', value: userId }]
  });

  console.log('[getFollowing] Found', follows.length, 'follow documents');

  // Get the actual user data for each followed user - deduplicate first
  const followingIds = [...new Set(follows.map(f => f.followingId))];
  console.log('[getFollowing] Unique following IDs:', followingIds.length);

  const following = await Promise.all(
    followingIds.map(async (followingId) => {
      const userData = await getDocument(`users/${followingId}`);
      if (userData) {
        return { id: followingId, ...userData };
      }
      return null;
    })
  );

  const validFollowing = following.filter(f => f !== null);
  console.log('[getFollowing] Returning', validFollowing.length, 'valid following');
  return validFollowing;
};
