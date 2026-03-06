import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyBQwZT5rMDmfeNMwhoz6q0VXJxF8ergYCU",
  authDomain: "seattle-karaoke.firebaseapp.com",
  projectId: "seattle-karaoke",
  storageBucket: "seattle-karaoke.firebasestorage.app",
  messagingSenderId: "843928576225",
  appId: "1:843928576225:web:fa135821f4391099a597a0",
  measurementId: "G-JF7JFDK3CG",
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
