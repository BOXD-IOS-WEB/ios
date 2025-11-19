/**
 * Native Firestore wrapper for Capacitor
 * Uses native Firebase plugins on iOS, Web SDK on web
 */

import { FirebaseFirestore } from '@capacitor-firebase/firestore';
import {
  doc,
  setDoc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  collection,
  where,
  orderBy,
  limit,
  DocumentSnapshot,
  QuerySnapshot,
  Timestamp as FirestoreTimestamp
} from 'firebase/firestore';

// Check if running in Capacitor
const isCapacitor = typeof window !== 'undefined' && (window as any).Capacitor;

// Lazy-load Web SDK Firestore only when needed (web platform only)
let _db: any = null;
const getWebDb = () => {
  if (!_db && !isCapacitor) {
    const { getFirestore } = require('firebase/firestore');
    const { default: app } = require('./firebase');
    _db = getFirestore(app);
  }
  return _db;
};

/**
 * Get a document from Firestore
 */
export const getDocument = async (path: string): Promise<any> => {
  if (isCapacitor) {
    console.log('[Firestore Native] Getting document:', path);
    try {
      const result = await FirebaseFirestore.getDocument({
        reference: path,
      });
      console.log('[Firestore Native] ✅ Document retrieved');
      return result.snapshot?.data || null;
    } catch (error) {
      console.error('[Firestore Native] ❌ Error getting document:', error);
      throw error;
    }
  } else {
    // Web SDK
    const db = getWebDb();
    const docRef = doc(db, ...path.split('/'));
    const docSnap = await getDoc(docRef);
    return docSnap.exists() ? docSnap.data() : null;
  }
};

/**
 * Set a document in Firestore
 */
export const setDocument = async (path: string, data: any, merge: boolean = false): Promise<void> => {
  if (isCapacitor) {
    console.log('[Firestore Native] Setting document:', path);
    try {
      const preparedData = prepareDataForFirestore(data);
      await FirebaseFirestore.setDocument({
        reference: path,
        data: preparedData,
        merge: merge,
      });
      console.log('[Firestore Native] ✅ Document set');
    } catch (error) {
      console.error('[Firestore Native] ❌ Error setting document:', error);
      throw error;
    }
  } else {
    // Web SDK
    const db = getWebDb();
    const docRef = doc(db, ...path.split('/'));
    await setDoc(docRef, data, merge ? { merge: true } : {});
  }
};

/**
 * Get documents from a collection with query
 */
export const getDocuments = async (
  collectionPath: string,
  queryOptions?: {
    where?: Array<{ field: string; operator: string; value: any }>;
    orderBy?: { field: string; direction?: 'asc' | 'desc' };
    limit?: number;
  }
): Promise<any[]> => {
  if (isCapacitor) {
    console.log('[Firestore Native] Getting documents from:', collectionPath);
    try {
      const queryConstraints: any[] = [];

      if (queryOptions?.where) {
        queryOptions.where.forEach(clause => {
          queryConstraints.push({
            type: 'where',
            fieldPath: clause.field,
            opStr: clause.operator,
            value: clause.value,
          });
        });
      }

      if (queryOptions?.orderBy) {
        queryConstraints.push({
          type: 'orderBy',
          fieldPath: queryOptions.orderBy.field,
          directionStr: queryOptions.orderBy.direction || 'asc',
        });
      }

      if (queryOptions?.limit) {
        queryConstraints.push({
          type: 'limit',
          limit: queryOptions.limit,
        });
      }

      const result = await FirebaseFirestore.getCollection({
        reference: collectionPath,
        queryConstraints: queryConstraints.length > 0 ? queryConstraints : undefined,
      });

      console.log('[Firestore Native] ✅ Documents retrieved:', result.snapshots?.length || 0);
      return result.snapshots?.map(snap => ({ id: snap.id, ...snap.data })) || [];
    } catch (error) {
      console.error('[Firestore Native] ❌ Error getting documents:', error);
      throw error;
    }
  } else {
    // Web SDK
    const db = getWebDb();
    const collectionRef = collection(db, collectionPath);
    const constraints: any[] = [];

    if (queryOptions?.where) {
      queryOptions.where.forEach(clause => {
        constraints.push(where(clause.field, clause.operator as any, clause.value));
      });
    }

    if (queryOptions?.orderBy) {
      constraints.push(orderBy(queryOptions.orderBy.field, queryOptions.orderBy.direction || 'asc'));
    }

    if (queryOptions?.limit) {
      constraints.push(limit(queryOptions.limit));
    }

    const q = query(collectionRef, ...constraints);
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  }
};

/**
 * Add a document to a collection
 */
export const addDocument = async (collectionPath: string, data: any): Promise<string> => {
  if (isCapacitor) {
    console.log('[Firestore Native] Adding document to:', collectionPath);
    try {
      const preparedData = prepareDataForFirestore(data);
      const result = await FirebaseFirestore.addDocument({
        reference: collectionPath,
        data: preparedData,
      });
      console.log('[Firestore Native] ✅ Document added with ID:', result.reference?.id);
      return result.reference?.id || '';
    } catch (error) {
      console.error('[Firestore Native] ❌ Error adding document:', error);
      throw error;
    }
  } else {
    // Web SDK
    const db = getWebDb();
    const collectionRef = collection(db, collectionPath);
    const docRef = await addDoc(collectionRef, data);
    return docRef.id;
  }
};

/**
 * Update a document in Firestore
 */
export const updateDocument = async (path: string, data: any): Promise<void> => {
  if (isCapacitor) {
    console.log('[Firestore Native] Updating document:', path);
    try {
      // Handle increment operations specially for native plugin
      const updateData: any = {};
      for (const [key, value] of Object.entries(data)) {
        if (value && typeof value === 'object' && '_increment' in value) {
          // Native plugin expects { increment: number } format
          updateData[key] = { increment: (value as any)._increment };
        } else {
          updateData[key] = value;
        }
      }

      const preparedData = prepareDataForFirestore(updateData);
      await FirebaseFirestore.updateDocument({
        reference: path,
        data: preparedData,
      });
      console.log('[Firestore Native] ✅ Document updated');
    } catch (error) {
      console.error('[Firestore Native] ❌ Error updating document:', error);
      throw error;
    }
  } else {
    // Web SDK
    const db = getWebDb();
    const docRef = doc(db, ...path.split('/'));
    await updateDoc(docRef, data);
  }
};

/**
 * Delete a document from Firestore
 */
export const deleteDocument = async (path: string): Promise<void> => {
  if (isCapacitor) {
    console.log('[Firestore Native] Deleting document:', path);
    try {
      await FirebaseFirestore.deleteDocument({
        reference: path,
      });
      console.log('[Firestore Native] ✅ Document deleted');
    } catch (error) {
      console.error('[Firestore Native] ❌ Error deleting document:', error);
      throw error;
    }
  } else {
    // Web SDK
    const db = getWebDb();
    const docRef = doc(db, ...path.split('/'));
    await deleteDoc(docRef);
  }
};

/**
 * Add timestamp helper
 */
export const serverTimestamp = () => {
  if (isCapacitor) {
    // For native, return a special marker that will be converted server-side
    return { _seconds: Math.floor(Date.now() / 1000), _nanoseconds: 0 };
  } else {
    return FirestoreTimestamp.now();
  }
};

/**
 * Create a Timestamp from a Date
 */
export const Timestamp = {
  now: () => {
    if (isCapacitor) {
      return { _seconds: Math.floor(Date.now() / 1000), _nanoseconds: 0 };
    } else {
      return FirestoreTimestamp.now();
    }
  },
  fromDate: (date: Date) => {
    if (isCapacitor) {
      return { _seconds: Math.floor(date.getTime() / 1000), _nanoseconds: 0 };
    } else {
      return FirestoreTimestamp.fromDate(date);
    }
  }
};

/**
 * Increment helper for updateDocument
 */
export const increment = (value: number) => {
  // Return a marker for increment operation
  return { _increment: value };
};

/**
 * Convert timestamp to Date
 */
export const timestampToDate = (timestamp: any): Date => {
  if (!timestamp) return new Date();

  if (timestamp instanceof Date) return timestamp;

  if (typeof timestamp === 'string') return new Date(timestamp);

  if (timestamp.toDate) return timestamp.toDate();

  if (timestamp.seconds) return new Date(timestamp.seconds * 1000);

  if (timestamp._seconds) return new Date(timestamp._seconds * 1000);

  return new Date();
};

/**
 * Prepare data for Firestore - convert Timestamps and special values
 */
const prepareDataForFirestore = (data: any): any => {
  if (!data || typeof data !== 'object') return data;

  if (Array.isArray(data)) {
    return data.map(prepareDataForFirestore);
  }

  const prepared: any = {};
  for (const [key, value] of Object.entries(data)) {
    if (value && typeof value === 'object') {
      // Handle Timestamp objects
      if (value._seconds !== undefined && value._nanoseconds !== undefined) {
        prepared[key] = isCapacitor
          ? new Date(value._seconds * 1000).toISOString()
          : value;
      }
      // Handle increment operations
      else if (value._increment !== undefined) {
        prepared[key] = value; // Native plugin will handle this
      }
      // Recursively prepare nested objects
      else {
        prepared[key] = prepareDataForFirestore(value);
      }
    } else {
      prepared[key] = value;
    }
  }
  return prepared;
};
