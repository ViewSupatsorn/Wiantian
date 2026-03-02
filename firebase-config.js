const firebaseConfig = {
  apiKey: "AIzaSyD_qjdPrR1UeGJcUS8j5d-jixSEaEsWVM4",
  authDomain: "projects01-f0402.firebaseapp.com",
  projectId: "projects01-f0402",
  storageBucket: "projects01-f0402.firebasestorage.app",
  messagingSenderId: "710380544450",
  appId: "1:710380544450:web:7a06ed06b8580ac196b65b",
  measurementId: "G-L16X0DK8ME"
};

// ต้องเป็นแบบนี้
firebase.initializeApp(firebaseConfig);

// กัน error undefined
window.firebaseDb = firebase.firestore();

console.log("Firebase initialized");