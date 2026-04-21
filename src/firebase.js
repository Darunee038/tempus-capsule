import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyAIiLG_aYVsPuxvZR-Ib3UK_itvPLSgsE4",
  authDomain: "tempus-capsule.firebaseapp.com",
  projectId: "tempus-capsule",
  storageBucket: "tempus-capsule-media-2026",
  messagingSenderId: "156840590743",
  appId: "1:156840590743:web:f2db9ece29b000bc6118d2",
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app, "gs://tempus-capsule-media-2026");
