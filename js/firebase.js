import { initializeApp } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-app.js";
import {
  getFirestore,
  collection,
  addDoc,
  onSnapshot,
  deleteDoc,
  doc,
  updateDoc,
} from "https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyDG7mLxc2CtGhBda5YrujXfvIt4M3SYZuc",
  authDomain: "hold-live-new.firebaseapp.com",
  projectId: "hold-live-new",
  storageBucket: "hold-live-new.firebasestorage.app",
  messagingSenderId: "223551988266",
  appId: "1:223551988266:web:ea25ec6c3db19109e9d953",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const col = collection(db, "products");

export function fetchProducts(cb) {
  return onSnapshot(col, (snap) => {
    cb(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
  });
}

export async function saveProduct(product) {
  return await addDoc(col, product);
}

export async function deleteFromFirebase(id) {
  return await deleteDoc(doc(db, "products", id));
}

export async function updateProduct(id, data) {
  return await updateDoc(doc(db, "products", id), data);
}

function isAdmin() {
  return localStorage.getItem("isAdmin") === "true";
}