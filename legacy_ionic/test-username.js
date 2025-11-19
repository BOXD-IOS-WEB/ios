import { initializeApp } from 'firebase/app';
import { getFirestore, collection, query, where, getDocs } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyAxxOGSqsd79qXvGUz7FEKgBuc-pafGE9A",
  authDomain: "box-boxd-f1-1759326853.firebaseapp.com",
  projectId: "box-boxd-f1-1759326853",
  storageBucket: "box-boxd-f1-1759326853.appspot.com",
  messagingSenderId: "750144678811",
  appId: "1:750144678811:web:47f55a4293e9b7e66dcf3e"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function checkUsername(username) {
  try {
    console.log('Checking username:', username);
    const usersRef = collection(db, 'users');
    const q = query(usersRef, where('username', '==', username));
    
    console.log('Executing query...');
    const snapshot = await getDocs(q);
    
    console.log('Query successful!');
    console.log('Empty:', snapshot.empty);
    console.log('Size:', snapshot.size);
    
    return snapshot.empty;
  } catch (error) {
    console.error('Error:', error);
    console.error('Error code:', error.code);
    console.error('Error message:', error.message);
    throw error;
  }
}

checkUsername('testuser')
  .then(available => console.log('Username available:', available))
  .catch(err => console.error('Failed:', err));
