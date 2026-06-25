// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-analytics.js";
import {
  getFirestore,
  collection,
  getDocs,
  addDoc,
} from "https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyA-fDNcAiaA_x4NPmkeCxA5CJxfxkNy_wE",
  authDomain: "hold-live.firebaseapp.com",
  projectId: "hold-live",
  storageBucket: "hold-live.firebasestorage.app",
  messagingSenderId: "174385633412",
  appId: "1:174385633412:web:589cca1940c411f9cc8ad1",
  measurementId: "G-3YLYRH53P0",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

const db = getFirestore(app);
const productsCollection = collection(db, "products");

export async function fetchProducts() {
  const snapshot = await getDocs(productsCollection);
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
}

export async function saveProduct(product) {
  await addDoc(productsCollection, product);
}
