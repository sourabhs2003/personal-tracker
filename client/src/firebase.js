
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCZMfIl46ea7C_1U_8XEmjpeImg4-so9tk",
  authDomain: "sourabhzssc.firebaseapp.com",
  projectId: "sourabhzssc",
  storageBucket: "sourabhzssc.firebasestorage.app",
  messagingSenderId: "31742915782",
  appId: "1:31742915782:web:29fa2b94b6d146aea6d3c7",
};

console.log("Firebase config in use:", firebaseConfig);

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
