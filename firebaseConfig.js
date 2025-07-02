import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

// Firebase configuration
// Replace with your actual Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyAEGFTECKH1YDzO5wVKK9c_nST2WdrL7J0",
  authDomain: "stepz-eb9c8.firebaseapp.com",
  projectId: "stepz-eb9c8",
  storageBucket: "stepz-eb9c8.firebasestorage.app",
  messagingSenderId: "915678337102",
  appId: "1:915678337102:web:f5f8a21a32a1be0df04b1f",
  measurementId: "G-HQG1GL27DY"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

export default app;