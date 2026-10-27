
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

export const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);

export const LOW_STOCK = 10; 

export function stockStatus(p) {
  if (p.status === "Draft") return "Draft";
  const n = Number(p.stock) || 0;
  if (n <= 0) return "Out of stock";
  if (n <= LOW_STOCK) return "Low stock";
  return "Active";
}
export const naira = n => "\u20A6" + Number(n || 0).toLocaleString("en-NG");
export const esc = s => String(s ?? "").replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));


export const imgSrc = u => /^(https?:|data:)/.test(u) ? u : "../client/" + u;
