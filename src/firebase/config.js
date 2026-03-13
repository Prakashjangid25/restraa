import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyCwksXAYjwefiELqpvloX3HWjxZzcNAJNg",
  authDomain: "restraa-3852b.firebaseapp.com",
  projectId: "restraa-3852b",
  storageBucket: "restraa-3852b.firebasestorage.app",
  messagingSenderId: "625296251677",
  appId: "1:625296251677:web:abf93730be2a0ce3e49ff4"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export default app;
