// src/firebase.js
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyACAAgYKS08NxgvYu2-Rd7C6hMqHeRRfNQ",
  authDomain: "physio-tracker-7065f.firebaseapp.com",
  projectId: "physio-tracker-7065f",
  storageBucket: "physio-tracker-7065f.firebasestorage.app",
  messagingSenderId: "156103727185",
  appId: "1:156103727185:web:d8cbb99ff0484bee0e0070",
  measurementId: "G-6TCYTL8J25"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firestore
const db = getFirestore(app);

export { db };
