// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import {getAuth, GoogleAuthProvider} from 'firebase/auth'
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyB7RQ9zEZKUonzXYB4Vfg7L5C77s71a57A",
  authDomain: "csci5410-f23-sdp10.firebaseapp.com",
  projectId: "csci5410-f23-sdp10",
  storageBucket: "csci5410-f23-sdp10.appspot.com",
  messagingSenderId: "872915050894",
  appId: "1:872915050894:web:452fb9049f0db5c8ee04df",
  measurementId: "G-R5EM518LJ5"
};



// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
export const auth =  getAuth(app);
export const googleProvider = new GoogleAuthProvider();