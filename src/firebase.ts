import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth, signInAnonymously, signInWithEmailAndPassword, signOut, onAuthStateChanged, User, setPersistence, browserLocalPersistence } from 'firebase/auth';

export type { User };

const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY as string,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN as string,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID as string,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET as string,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID as string,
  appId: process.env.REACT_APP_FIREBASE_APP_ID as string,
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);

export const auth = getAuth(app);

// Set default persistence to local (for anonymous users and general use)
setPersistence(auth, browserLocalPersistence).then(() => {
  // Check for existing auth state
  onAuthStateChanged(auth, (user) => {
    if (!user) {
      // Sign in anonymously for guest users (so Firestore rules pass)
      signInAnonymously(auth).catch((err) => {
        // eslint-disable-next-line no-console
        console.error('Anonymous sign-in failed:', err);
      });
    }
  });
}).catch((err) => {
  console.error('Failed to set persistence:', err);
}); 