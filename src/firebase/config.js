import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBcMl6yhzP2ZrbE6l7lyAdwgSMKTChojZo",
  authDomain: "sks-counting.firebaseapp.com",
  projectId: "sks-counting",
  storageBucket: "sks-counting.firebasestorage.app",
  messagingSenderId: "848863999669",
  appId: "1:848863999669:web:5256778c6627c72746b0fc",
  measurementId: "G-FBH70TD0ZZ"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const provider = new GoogleAuthProvider();
export const db = getFirestore(app);
