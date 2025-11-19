import { getCurrentUser } from '@/lib/auth-native';
import {
  getDocument,
  setDocument,
  getDocuments,
  addDocument,
  updateDocument,
  deleteDocument,
  Timestamp,
  increment,
  timestampToDate
} from '@/lib/firestore-native';

export interface RaceListItem {
  raceYear: number;
  raceName: string;
  raceLocation: string;
  countryCode?: string;
  order: number;
  note: string;
}

export interface RaceList {
  id?: string;
  userId: string;
  username: string;
  userProfileImageUrl: string;
  title: string;
  description: string;
  races: RaceListItem[];
  isPublic: boolean;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
  likesCount: number;
  commentsCount: number;
}

export const createList = async (list: Omit<RaceList, 'id' | 'createdAt' | 'updatedAt' | 'likesCount' | 'commentsCount'>) => {
  const user = await getCurrentUser();
  if (!user) {
    console.error('[createList] User not authenticated');
    throw new Error('User not authenticated');
  }

  console.log('[createList] Creating list for user:', user.uid);
  console.log('[createList] List data:', list);

  const newList = {
    ...list,
    userId: user.uid,
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
    likesCount: 0,
    commentsCount: 0
  };

  console.log('[createList] newList with timestamps:', newList);

  try {
    const docId = await addDocument('lists', newList);
    console.log('[createList] List created successfully with ID:', docId);

    await updateDocument(`userStats/${user.uid}`, {
      listsCount: increment(1)
    });
    console.log('[createList] User stats updated');

    return docId;
  } catch (error) {
    console.error('[createList] Error creating list:', error);
    throw error;
  }
};

export const getUserLists = async (userId: string) => {
  console.log('[getUserLists] Fetching lists for user:', userId);

  try {
    const docs = await getDocuments('lists', {
      where: [{ field: 'userId', operator: '==', value: userId }],
      orderBy: { field: 'updatedAt', direction: 'desc' }
    });
    console.log('[getUserLists] Found', docs.length, 'lists');

    return docs.map(doc => ({
      ...doc,
      createdAt: timestampToDate(doc.createdAt),
      updatedAt: timestampToDate(doc.updatedAt)
    })) as RaceList[];
  } catch (error) {
    console.error('[getUserLists] Error fetching lists:', error);
    throw error;
  }
};

export const getPublicLists = async () => {
  const docs = await getDocuments('lists', {
    where: [{ field: 'isPublic', operator: '==', value: true }],
    orderBy: { field: 'updatedAt', direction: 'desc' }
  });
  return docs.map(doc => ({
    ...doc,
    createdAt: timestampToDate(doc.createdAt),
    updatedAt: timestampToDate(doc.updatedAt)
  })) as RaceList[];
};

export const getListById = async (listId: string) => {
  const data = await getDocument(`lists/${listId}`);
  if (data) {
    return {
      id: listId,
      ...data,
      createdAt: timestampToDate(data.createdAt),
      updatedAt: timestampToDate(data.updatedAt)
    } as RaceList;
  }
  return null;
};

export const updateList = async (listId: string, updates: Partial<RaceList>) => {
  await updateDocument(`lists/${listId}`, {
    ...updates,
    updatedAt: Timestamp.now()
  });
};

export const deleteList = async (listId: string) => {
  const user = await getCurrentUser();
  if (!user) throw new Error('User not authenticated');

  await deleteDocument(`lists/${listId}`);

  await updateDocument(`userStats/${user.uid}`, {
    listsCount: increment(-1)
  });
};

export const addRaceToList = async (listId: string, race: RaceListItem) => {
  const listDoc = await getListById(listId);
  if (!listDoc) throw new Error('List not found');

  const updatedRaces = [...(listDoc.races || []), { ...race, order: listDoc.races?.length || 0 }];
  await updateList(listId, { races: updatedRaces });
};

export const removeRaceFromList = async (listId: string, raceIndex: number) => {
  const listDoc = await getListById(listId);
  if (!listDoc) throw new Error('List not found');

  const updatedRaces = listDoc.races?.filter((_, idx) => idx !== raceIndex) || [];
  await updateList(listId, { races: updatedRaces });
};
