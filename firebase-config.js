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
const sensorRef = database.ref('sensor_data/latest');
const historyRef = database.ref('sensor_data/history');

// ============================================
// HELPER FUNCTIONS
// ============================================

function getDateStr() {
    const now = new Date();
    return now.toISOString().split('T')[0]; // "2026-08-05"
}

function getTimeStr() {
    const now = new Date();
    return now.toTimeString().split(' ')[0]; // "18:30:00"
}

// ============================================
// SAVE TO HISTORY
// ============================================

function saveToHistory(temp, humid, gas) {
    const dateStr = getDateStr();
    const timeStr = getTimeStr();
    
    const data = {
        temperature: temp,
        humidity: humid,
        gas: gas
    };
    
    const path = `sensor_data/history/${dateStr}/${timeStr}`;
    database.ref(path).set(data);
    
    // ==========================================
    // CLEANUP OLD DATA (>30 MINIT) - TAMBAH DI SINI
    // ==========================================
    cleanupOldData();
}

// ============================================
// CLEANUP OLD DATA (>30 MINIT) - LENGKAP
// ============================================

function cleanupOldData() {
    const now = new Date();
    const cutoffTime = new Date(now.getTime() - (30 * 60 * 1000));
    const cutoffDateStr = cutoffTime.toISOString().split('T')[0];
    const cutoffTimeStr = cutoffTime.toTimeString().split(' ')[0];
    
    historyRef.once('value', (snapshot) => {
        const history = snapshot.val();
        if (!history) return;
        
        const updates = {};
        let deleteCount = 0;
        
        Object.keys(history).forEach(date => {
            // If date is older than cutoff date, delete entire date
            if (date < cutoffDateStr) {
                updates[date] = null;
                deleteCount++;
                return;
            }
            
            // If same date, check times
            if (date === cutoffDateStr) {
                const times = history[date];
                Object.keys(times).forEach(time => {
                    if (time < cutoffTimeStr) {
                        updates[`${date}/${time}`] = null;
                        deleteCount++;
                    }
                });
            }
        });
        
        // Apply updates (delete old data)
        if (deleteCount > 0) {
            historyRef.update(updates);
            console.log(`🧹 Cleaned ${deleteCount} old data entries (>30 minit)`);
        }
    });
}

// ============================================
// GET HISTORY FOR LAST 30 MINUTES
// ============================================

function getHistoryData(callback) {
    const now = new Date();
    const cutoffTime = new Date(now.getTime() - (30 * 60 * 1000));
    const cutoffDateStr = cutoffTime.toISOString().split('T')[0];
    const cutoffTimeStr = cutoffTime.toTimeString().split(' ')[0];
    
    historyRef.once('value', (snapshot) => {
        const history = snapshot.val();
        if (!history) {
            callback([]);
            return;
        }
        
        const results = [];
        
        Object.keys(history).forEach(date => {
            if (date < cutoffDateStr) return;
            
            const times = history[date];
            Object.keys(times).forEach(time => {
                if (date === cutoffDateStr && time < cutoffTimeStr) return;
                
                const data = times[time];
                results.push({
                    timestamp: `${date} ${time}`,
                    temperature: data.temperature || 0,
                    humidity: data.humidity || 0,
                    gas: data.gas || 0
                });
            });
        });
        
        // Sort by timestamp
        results.sort((a, b) => a.timestamp.localeCompare(b.timestamp));
        callback(results);
    });
}

// ============================================
// STATUS CHECK FUNCTIONS
// ============================================

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
    
    if (value >= 70) {
        return { text: '⚠️ Warning', class: 'warning' };
    } else {
        return { text: '✅ Normal', class: 'normal' };
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
    const humidStatus = getHumidityStatus(humid);
    
    if (tempStatus.class === 'danger' || gasStatus.class === 'danger') {
        return { text: '🚨 DANGER!', class: 'danger' };
    }
    
    if (tempStatus.class === 'warning' || 
        gasStatus.class === 'warning' || 
        humidStatus.class === 'warning') {
        return { text: '⚠️ Warning', class: 'warning' };
    }
    
    return { text: '✅ Sistem Normal', class: 'normal' };
}