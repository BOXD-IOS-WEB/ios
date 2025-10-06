import { initializeApp } from 'firebase/app';
import { getAuth, setPersistence, browserLocalPersistence } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: "AIzaSyAxxOGSqsd79qXvGUz7FEKgBuc-pafGE9A",
  authDomain: "box-boxd.firebaseapp.com",
  projectId: "box-boxd",
  storageBucket: "box-boxd.appspot.com",
  messagingSenderId: "750144678811",
  appId: "1:750144678811:web:47f55a4293e9b7e66dcf3e"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

// Enable auth persistence
setPersistence(auth, browserLocalPersistence).catch((error) => {
  console.error('Error setting auth persistence:', error);
});

export default app;
