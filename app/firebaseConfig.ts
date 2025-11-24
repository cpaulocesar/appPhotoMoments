import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getAnalytics } from 'firebase/analytics';

const firebaseConfig = {
  apiKey: "AIzaSyDlb6Ek1PvC4iS8-dJoq37qmTezRjmITc4",
  authDomain: "photomomentsapp.firebaseapp.com",
  projectId: "photomomentsapp",
  storageBucket: "photomomentsapp.appspot.com",
  messagingSenderId: "579644650148",
  appId: "1:579644650148:web:d9f96321cbba88a0b96c31",
  measurementId: "G-GG3KGMVHZH"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const analytics = getAnalytics(app);

export default app;
