import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyDnGfOX2ypB2deyxCxF7INkRNwM2lZCKbk",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "miniappquiz.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "miniappquiz",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "miniappquiz.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "971097098091",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:971097098091:web:52ce2ae75299e614ea2e2e",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "G-9E2NT3ZWJQ",
};

let db = null;

const isConfigValid = Boolean(
  firebaseConfig.apiKey &&
  firebaseConfig.projectId &&
  firebaseConfig.apiKey !== "undefined" &&
  firebaseConfig.projectId !== "undefined",
);

if (isConfigValid) {
  try {
    const app = initializeApp(firebaseConfig);
    db = getFirestore(app);
  } catch (error) {
    console.warn("Lỗi khi khởi tạo Firebase Firestore:", error);
    db = null;
  }
} else {
  console.warn(
    "Firebase chưa được cấu hình biến môi trường hoặc không hợp lệ. Đang dùng dữ liệu Local Storage / static JSON.",
  );
}

export { db };
