// js/firebase-config.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.8.1/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/11.8.1/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/11.8.1/firebase-firestore.js";

// Configuración real de tu app Firebase
const firebaseConfig = {
  apiKey: "AIzaSyBYsouWRREA0ppmbn7rvpCrxpax8W02Fvs",
  authDomain: "colordrop-5a39e.firebaseapp.com",
  projectId: "colordrop-5a39e",
  storageBucket: "colordrop-5a39e.firebasestorage.app",
  messagingSenderId: "149998751624",
  appId: "1:149998751624:web:ba8d9025a0110206b2743d",
  measurementId: "G-V25S9YLPJW"
};

// Inicializa Firebase y exporta Auth + Firestore
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
