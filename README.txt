📌 PENGENALAN
Dokumen ini menerangkan langkah-langkah untuk menggunakan akaun Firebase sendiri bagi sistem monitoring penggera kebakaran. Struktur pangkalan data TIDAK PERLU DIUBAH - hanya kunci konfigurasi Firebase perlu dikemaskini.

🔧 LANGKAH 1: DAFTAR AKAUN FIREBASE
Buka Firebase Console

Klik "Create a project" atau "Add project"
Masukkan nama projek (contoh: sistem-penggera-kebakaran)
Matikan Google Analytics (pilih "Disable")
Klik "Create project" dan tunggu siap

🔧 LANGKAH 2: WUJUDKAN REALTIME DATABASE
Di sebelah kiri, klik "Realtime Database"

Klik "Create Database"
Pilih lokasi: "asia-southeast1" (Singapura - paling cepat untuk Malaysia)
Pilih "Start in test mode" (untuk development)
Klik "Enable"

🔧 LANGKAH 3: DAPATKAN KUNCI KONFIGURASI

Di Firebase Console, klik ikon ⚙️ Settings (gear) → "Project settings"
Di bawah "Your apps", klik "</>" (Web) untuk tambah aplikasi web
Masukkan nama aplikasi (contoh: dashboard-penggera)
Tidak perlu setup Firebase Hosting
Klik "Register app"
SALIN kod konfigurasi yang dipaparkan:

javascript
const firebaseConfig = {
  apiKey: "AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
  authDomain: "your-project.firebaseapp.com",
  databaseURL: "https://your-project-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "your-project",
  storageBucket: "your-project.firebasestorage.app",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:abcdef1234567890"
};
📌 SIMPAN kod ini - anda perlukannya untuk Langkah 4

🔧 LANGKAH 4: KEMASKINI FAIL KONFIGURASI
Buka fail firebase-config.js dan GANTIKAN semua nilai dengan yang baru:

❌ LAMA (GANTI):
javascript
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
✅ BARU (TUKAR KE):
javascript
const firebaseConfig = {
    apiKey: "AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXX",    // ← Tukar
    authDomain: "your-project.firebaseapp.com",      // ← Tukar
    databaseURL: "https://your-project-default-rtdb.asia-southeast1.firebasedatabase.app", // ← Tukar
    projectId: "your-project",                       // ← Tukar
    storageBucket: "your-project.firebasestorage.app", // ← Tukar
    messagingSenderId: "123456789012",               // ← Tukar
    appId: "1:123456789012:web:abcdef1234567890",    // ← Tukar
    measurementId: "G-XXXXXXXXXX"                    // ← (Jika ada, tukar)
};

🔧 LANGKAH 5: STRUKTUR PANGKALAN DATA (TIDAK PERLU TUKAR!)
PENTING: Anda TIDAK PERLU mencipta struktur data. Sistem akan otomatik cipta apabila data pertama dihantar. Tetapi pastikan format data seperti berikut:

text
sensor_data/
├── latest/              ← Data terkini
│   ├── temperature: 28.5
│   ├── humidity: 65.2
│   └── gas: 150
└── history/             ← Data sejarah
    └── YYYY-MM-DD/
        └── HH:MM:SS/
            ├── temperature: 28.5
            ├── humidity: 65.2
            └── gas: 150
🔧 LANGKAH 6: KEMASKINI PERATURAN KESELAMATAN (PENTING!)
Untuk membenarkan baca/tulis dari aplikasi:

Di Firebase Console, klik "Realtime Database"

Klik tab "Rules"

GANTIKAN dengan kod ini:

json
{
  "rules": {
    ".read": true,
    ".write": true,
    "sensor_data": {
      ".read": true,
      ".write": true,
      "latest": {
        ".read": true,
        ".write": true
      },
      "history": {
        ".read": true,
        ".write": true,
        "$date": {
          ".read": true,
          ".write": true,
          "$time": {
            ".read": true,
            ".write": true
          }
        }
      }
    }
  }
}
Klik "Publish"

⚠️ NOTA: Untuk production, gunakan peraturan yang lebih ketat dengan authentication.

🔧 LANGKAH 7:
Jika anda menggunakan backend Python yang berbeza:

Buka index.html

Cari baris ini (lebih kurang line 430):

javascript
const backendUrl = 'https://koa-system.onrender.com/generate-excel';
TUKAR ke URL backend anda:

javascript
const backendUrl = 'https://your-backend-url.com/generate-excel';