// src/firebase.js
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

// Replace with your firebase config object
const firebaseConfig = {
  apiKey: "AIzaSyANBU-GMAFpUf25CsiS8dj-pDyhEVYwwgo",
  authDomain: "adapta-ba4b0.firebaseapp.com", // Ensure this matches your Firebase Console
  projectId: "adapta-ba4b0",
  storageBucket: "adapta-ba4b0.firebasestorage.app",
  messagingSenderId: "984591985517",
  appId: "1:984591985517:web:9f1ac1279584e829c9c864",
  measurementId: "G-DNB1C33QG8",
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export default app;
