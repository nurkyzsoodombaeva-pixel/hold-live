import { initializeApp } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-app.js";
import {
  getFirestore,
  collection,
  addDoc,
  onSnapshot,
} from "https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyDG7mLxc2CtGhBda5YrujXfvIt4M3SYZuc",
  authDomain: "hold-live-new.firebaseapp.com",
  projectId: "hold-live-new",
  storageBucket: "hold-live-new.firebasestorage.app",
  messagingSenderId: "223551988266",
  appId: "1:223551988266:web:ea25ec6c3db19109e9d953",
  measurementId: "G-EHTLK9SG0G",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const productsCollection = collection(db, "products");

// Получение товаров в реальном времени
export function fetchProducts(callback) {
  return onSnapshot(productsCollection, (snapshot) => {
    const products = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    callback(products);
  });
}

// Добавление товара
export async function saveProduct(product) {
  try {
    console.log("TRY SAVE:", product);

    const docRef = await addDoc(productsCollection, product);

    console.log("SAVED:", docRef.id);
    return docRef;
  } catch (error) {
    console.error("FIREBASE ERROR:", error);
    throw error;
  }
}