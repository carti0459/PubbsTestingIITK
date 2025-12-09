import { initializeApp, getApps } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getDatabase } from "firebase/database";

const firebaseServerConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY, 
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  databaseURL: process.env.FIREBASE_DATABASE_URL, // Private
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET, // Private
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID, // Private
  appId: process.env.FIREBASE_APP_ID, // Private
  measurementId: process.env.FIREBASE_MEASUREMENT_ID, // Private
};

const serverApp = getApps().find(app => app.name === 'server') || 
  initializeApp(firebaseServerConfig, 'server');

export const serverAuth = getAuth(serverApp);
export const realtimeDb = getDatabase(serverApp);


export default serverApp;
