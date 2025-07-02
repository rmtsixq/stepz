import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

// Firebase configuration
// Replace with your actual Firebase config
const firebaseConfig = {
  apiKey: "your-api-key-here",
  authDomain: "stepz-rumet.firebaseapp.com",
  projectId: "stepz-rumet",
  storageBucket: "stepz-rumet.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:android:abc123def456"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

export default app;