import { getApps, initializeApp, type FirebaseApp } from 'firebase/app';
import { getAuth, type Auth } from 'firebase/auth';
import { getFirestore, type Firestore } from 'firebase/firestore';

// Firebase configuration
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

// Chỉ khởi tạo Firebase trên trình duyệt hoặc khi có đủ biến môi trường.
const isBrowser = typeof window !== 'undefined';

let app: FirebaseApp | undefined;
let authInstance: Auth | undefined;
let dbInstance: Firestore | undefined;

try {
  const hasEnv = Boolean(
    firebaseConfig.apiKey &&
      firebaseConfig.authDomain &&
      firebaseConfig.projectId &&
      firebaseConfig.appId,
  );

  if (isBrowser && hasEnv) {
    app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);
    authInstance = getAuth(app);
    dbInstance = getFirestore(app);
  }
} catch {
  // Bỏ qua khi build server/CI không có env, tránh crash do auth/invalid-api-key
}

export const appClient = app;
export const auth = authInstance as unknown as Auth; // chỉ dùng ở client
export const db = dbInstance as unknown as Firestore; // chỉ dùng ở client

export default appClient;
