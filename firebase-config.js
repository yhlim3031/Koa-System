// ============================================
// FIREBASE CONFIGURATION
// ============================================
const firebaseConfig = {
    apiKey: "AIzaSyB4YeCDMSExq8XNenCqJ98Es3SJJ1oUoqM",
    authDomain: "koa-system-4035d.firebaseapp.com",
    databaseURL: "https://koa-system-4035d-default-rtdb.asia-southeast1.firebasedatabase.app",
    projectId: "koa-system-4035d",
    storageBucket: "koa-system-4035d.firebasestorage.app",
    messagingSenderId: "177845903862",
    appId: "1:177845903862:web:d7205154d21c77502167d7",
    measurementId: "G-738DY1MGRK"
};

// ★ INISIALISASI FIREBASE DI SINI ★
firebase.initializeApp(firebaseConfig);

const database = firebase.database();
const sensorRef = database.ref('sensor_data/latest');
const historyRef = database.ref('sensor_data/history');