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
// INITIALIZE FIREBASE
// ============================================

firebase.initializeApp(firebaseConfig);

const database = firebase.database();

// ============================================
// DEBUG: CHECK DATABASE PATH
// ============================================

// TEST 1: Check entire sensor_data
const sensorDataRef = database.ref('sensor_data');

sensorDataRef.on('value', (snapshot) => {
    const data = snapshot.val();
    console.log('🔍 FULL sensor_data:', data);
}, (error) => {
    console.error('❌ Error reading sensor_data:', error);
});

// TEST 2: Check latest data
const sensorRef = database.ref('sensor_data/latest');

sensorRef.on('value', (snapshot) => {
    const data = snapshot.val();
    console.log('🔍 LATEST data:', data);
    
    if (data) {
        console.log('✅ Data found!');
        console.log('   Temperature:', data.temperature);
        console.log('   Humidity:', data.humidity);
        console.log('   Gas:', data.gas);
        console.log('   Timestamp:', data.timestamp);
    } else {
        console.warn('⚠️ No data at sensor_data/latest');
    }
}, (error) => {
    console.error('❌ Error reading latest:', error);
});

// ============================================
// THRESHOLD VALUES
// ============================================

const THRESHOLDS = {
    temperature: {
        normal: { min: 0, max: 35 },
        warning: { min: 37, max: 40 },
        danger: { min: 45, max: Infinity }
    },
    humidity: {
        normal: { min: 30, max: 70 },
        warning: { min: 0, max: 30 },
        warningHigh: { min: 70, max: Infinity }
    },
    gas: {
        safe: { min: 0, max: 300 },
        warning: { min: 301, max: 700 },
        danger: { min: 701, max: Infinity }
    }
};

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

function getTemperatureStatus(value) {
    if (value === undefined || value === null || isNaN(value)) {
        return { text: '--', class: '' };
    }
    
    if (value >= 45) {
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