// Use the SAME Firebase settings as admin/js/firebase-config.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyDDNOo-I3WhTk1HbzNjoQokldaMp70CU6U",
  authDomain: "gbogbolowo-ecommerce.firebaseapp.com",
  projectId: "gbogbolowo-ecommerce",
  storageBucket: "gbogbolowo-ecommerce.firebasestorage.app",
  messagingSenderId: "183345935285",
  appId: "1:183345935285:web:f254b3c81b80dd9af01ffc"
};

export const db = getFirestore(initializeApp(firebaseConfig));
export const naira = n => "\u20A6" + Number(n || 0).toLocaleString("en-NG");
export const esc = s => String(s ?? "").replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

// Paystack PUBLIC test key from dashboard.paystack.com > Settings > API Keys (starts with pk_test_). Never put the secret key here.
// export const PAYSTACK_KEY = "
export  const  PAYSTACK_KEY = "pk_test_f9810fe404e60f086e6f2f0907e6feee0c66f6f1"