import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDQ4NENz7h3lVx0t_OaKtRc3UwoKk4_dD8",
  authDomain: "transactionsem-c4c1c.firebaseapp.com",
  projectId: "transactionsem-c4c1c",
  storageBucket: "transactionsem-c4c1c.appspot.com",
  messagingSenderId: "302267093292",
  appId: "1:302267093292:web:0a35f166133a377b841c89",
  databaseURL: "https://default.firebaseio.com",
};

export const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
