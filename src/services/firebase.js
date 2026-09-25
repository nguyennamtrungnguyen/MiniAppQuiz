import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

// ⚙️ Dán cấu hình Firebase của bạn vào đây (hoặc dùng biến môi trường VITE_FIREBASE_...)
const firebaseConfig = {
  apiKey: "AIzaSyDnGfOX2ypB2deyxCxF7INkRNwM2lZCKbk",
  authDomain: "miniappquiz.firebaseapp.com",
  projectId: "miniappquiz",
  storageBucket: "miniappquiz.firebasestorage.app",
  messagingSenderId: "971097098091",
  appId: "1:971097098091:web:52ce2ae75299e614ea2e2e",
  measurementId: "G-9E2NT3ZWJQ"
};

// Kiểm tra xem đã điền cấu hình thật chưa
export const isFirebaseConfigured = Boolean(
  firebaseConfig.apiKey && 
  firebaseConfig.apiKey !== "YOUR_API_KEY" && 
  firebaseConfig.projectId !== "YOUR_PROJECT_ID"
);

let app = null;
let db = null;

if (isFirebaseConfigured) {
  try {
    app = initializeApp(firebaseConfig);
    db = getFirestore(app);
  } catch (error) {
    console.error("Lỗi khởi tạo Firebase:", error);
  }
}

export { db };
