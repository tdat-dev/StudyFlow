// Cấu hình Firebase Emulator
// Sử dụng file này để kết nối với Firebase Emulator Suite
// Chạy lệnh: firebase emulators:start để khởi động emulator

const { initializeApp } = require("firebase/app");
const { getFirestore, connectFirestoreEmulator } = require("firebase/firestore");
const { getAuth, connectAuthEmulator } = require("firebase/auth");

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID
};

// Khởi tạo Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Kết nối với Firestore Emulator
connectFirestoreEmulator(db, 'localhost', 8080);

// Kết nối với Auth Emulator
connectAuthEmulator(auth, 'http://localhost:9099');

console.log('Connected to Firebase Emulators');

module.exports = { app, auth, db };