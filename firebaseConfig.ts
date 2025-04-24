import { initializeApp } from "firebase/app";
import { getAuth, initializeAuth, getReactNativePersistence } from "firebase/auth"; 
import { getFirestore } from "firebase/firestore";
import { getAnalytics, isSupported } from "firebase/analytics";
import ReactNativeAsyncStorage from "@react-native-async-storage/async-storage";
import { FIREBASE_API_KEY } from '@env';

const firebaseConfig = {
  apiKey: FIREBASE_API_KEY,
  authDomain: "mydiettracker-d2052.firebaseapp.com",
  projectId: "mydiettracker-d2052",
  storageBucket: "mydiettracker-d2052.firebasestorage.app",
  messagingSenderId: "472919744145",
  appId: "1:472919744145:web:5df85e9f76160ba9f2a930",
  measurementId: "G-TFR4G0S9G3",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Use AsyncStorage to persist authentication state
export const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(ReactNativeAsyncStorage),
});

// Initialize Firestore Database
export const db = getFirestore(app);

// Check if analytics is supported before initializing
let analytics;
isSupported().then((supported) => {
  if (supported) {
    analytics = getAnalytics(app);
  }
});

export { app, analytics };
