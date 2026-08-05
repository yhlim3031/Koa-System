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

// ============================================
// THRESHOLD VALUES (DIOPTIMAKAN)
// ============================================

const THRESHOLDS = {
    // Temperature (DHT11)
    temperature: {
        normal: { min: 0, max: 35 },
        warning: { min: 37, max: 40 },
        danger: { min: 45, max: Infinity }  // DANGER 45°C (jarak dari 37°C)
    },
    // Humidity (DHT11)
    humidity: {
        normal: { min: 30, max: 70 },
        warning: { min: 0, max: 30 },
        warningHigh: { min: 70, max: Infinity }
    },
    // Gas MQ2 (ADC value 0-4095)
    gas: {
        safe: { min: 0, max: 300 },
        warning: { min: 301, max: 700 },
        danger: { min: 701, max: Infinity }
    }
};

// ============================================
// INITIALIZE FIREBASE
// ============================================

firebase.initializeApp(firebaseConfig);

const database = firebase.database();
const sensorRef = database.ref('sensor_data/latest');

// ============================================
// HELPER FUNCTIONS
// ============================================

function formatTimestamp(timestamp) {
    if (!timestamp) return '--';
    const date = new Date(timestamp);
    return date.toLocaleString('ms-MY', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
    });
}

// ============================================
// STATUS CHECK FUNCTIONS
// ============================================

function getTemperatureStatus(value) {
    if (value === undefined || value === null || isNaN(value)) {
        return { text: '--', class: '' };
    }
    
    if (value >= 45) {  // DANGER 45°C
        return { text: '🚨 DANGER!', class: 'danger' };
    } else if (value >= 37 && value <= 40) {
        return { text: '⚠️ Warning', class: 'warning' };
    } else if (value >= 0 && value <= 35) {
        return { text: '✅ Normal', class: 'normal' };
    } else {
        return { text: '⚠️ Warning', class: 'warning' };
    }
}

function getHumidityStatus(value) {
    if (value === undefined || value === null || isNaN(value)) {
        return { text: '--', class: '' };
    }
    
    if (value >= 30 && value <= 70) {
        return { text: '✅ Normal', class: 'normal' };
    } else {
        return { text: '⚠️ Warning', class: 'warning' };
    }
}

function getGasStatus(value) {
    if (value === undefined || value === null || isNaN(value)) {
        return { text: '--', class: '' };
    }
    
    if (value > 700) {
        return { text: '🚨 DANGER!', class: 'danger' };
    } else if (value >= 301 && value <= 700) {
        return { text: '⚠️ Warning', class: 'warning' };
    } else if (value >= 0 && value <= 300) {
        return { text: '✅ Safe', class: 'normal' };
    } else {
        return { text: '⚠️ Warning', class: 'warning' };
    }
}

function getSystemStatus(temp, humid, gas) {
    const tempStatus = getTemperatureStatus(temp);
    const gasStatus = getGasStatus(gas);
    
    if (tempStatus.class === 'danger' || gasStatus.class === 'danger') {
        return { text: '🚨 DANGER!', class: 'danger' };
    }
    
    if (tempStatus.class === 'warning' || 
        gasStatus.class === 'warning' || 
        getHumidityStatus(humid).class === 'warning') {
        return { text: '⚠️ Warning', class: 'warning' };
    }
    
    return { text: '✅ Sistem Normal', class: 'normal' };
}