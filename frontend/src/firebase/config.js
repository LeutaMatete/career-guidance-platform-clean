// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDVjaJSPv_Q5PlkAr7ngAdcBkNhkdjtb3M",
  authDomain: "careerguidanceplatform-3fb80.firebaseapp.com",
  projectId: "careerguidanceplatform-3fb80",
  storageBucket: "careerguidanceplatform-3fb80.firebasestorage.app",
  messagingSenderId: "670163373747",
  appId: "1:670163373747:web:eaffcc447ca65940802ac6",
  measurementId: "G-K09Y2DETD9"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
const analytics = getAnalytics(app);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

// Export the app instance and analytics
export { analytics };
export default app;