import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyC86DdPuzWE4tIoKhVPzvPyI8EEYFlBzYk",
  authDomain: "scenario-builder-d0506.firebaseapp.com",
  projectId: "scenario-builder-d0506",
  storageBucket: "scenario-builder-d0506.firebasestorage.app",
  messagingSenderId: "309538721030",
  appId: "1:309538721030:web:e499d33cfbe8f68551a287"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Auth & Google Provider
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

// Initialize Firestore
export const db = getFirestore(app, "ai-studio-2d506a7c-a616-4e05-87a1-5be195d2d5a9");
