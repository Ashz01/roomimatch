import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCjFp_7mJr3UHSURVkHqG53aU1HpV3wBYE",
  authDomain: "roomimatch-a9da3.firebaseapp.com",
  projectId: "roomimatch-a9da3",
  storageBucket: "roomimatch-a9da3.firebasestorage.app",
  messagingSenderId: "618896629728",
  appId: "1:618896629728:web:519541242ce00b5200d585"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);