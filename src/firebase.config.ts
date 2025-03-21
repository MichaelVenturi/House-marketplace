import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
export const firebaseConfig = {
  apiKey: "AIzaSyD6Co-DvmqFpIuO-jH5dc6tNJIuG_rERm8",
  authDomain: "house-marketplace-e4063.firebaseapp.com",
  projectId: "house-marketplace-e4063",
  storageBucket: "house-marketplace-e4063.firebasestorage.app",
  messagingSenderId: "274481695517",
  appId: "1:274481695517:web:41eab89edf58af0f6d2ff4",
  measurementId: "G-BVG6EK7NKM",
};

// Initialize Firebase
initializeApp(firebaseConfig);
export const analytics = getAnalytics();
export const auth = getAuth();
export const db = getFirestore();
