import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  Timestamp,
  increment
} from 'firebase/firestore';
import { db, auth } from '@/lib/firebase';

export interface RaceListItem {
  raceYear: number;
  raceName: string;
  raceLocation: string;
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

const listsCollection = collection(db, 'lists');

export const createList = async (list: Omit<RaceList, 'id' | 'createdAt' | 'updatedAt' | 'likesCount' | 'commentsCount'>) => {
  const user = auth.currentUser;
  if (!user) throw new Error('User not authenticated');

  const newList = {
    ...list,
    userId: user.uid,
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
    likesCount: 0,
    commentsCount: 0
  };

  const docRef = await addDoc(listsCollection, newList);

  await updateDoc(doc(db, 'userStats', user.uid), {
    listsCount: increment(1)
  });

  return docRef.id;
};

export const getUserLists = async (userId: string) => {
  const q = query(
    listsCollection,
    where('userId', '==', userId),
    orderBy('updatedAt', 'desc')
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as RaceList));
};

export const getPublicLists = async () => {
  const q = query(
    listsCollection,
    where('isPublic', '==', true),
    orderBy('updatedAt', 'desc')
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as RaceList));
};

export const getListById = async (listId: string) => {
  const docRef = doc(db, 'lists', listId);
  const docSnap = await getDoc(docRef);
  if (docSnap.exists()) {
    return { id: docSnap.id, ...docSnap.data() } as RaceList;
  }
  return null;
};

export const updateList = async (listId: string, updates: Partial<RaceList>) => {
  const docRef = doc(db, 'lists', listId);
  await updateDoc(docRef, {
    ...updates,
    updatedAt: Timestamp.now()
  });
};

export const deleteList = async (listId: string) => {
  const user = auth.currentUser;
  if (!user) throw new Error('User not authenticated');

  const docRef = doc(db, 'lists', listId);
  await deleteDoc(docRef);

  await updateDoc(doc(db, 'userStats', user.uid), {
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
