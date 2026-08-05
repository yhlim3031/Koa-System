// ============================================
// DASHBOARD CONTROLLER - OPTIMIZED VERSION
// ============================================

// Chart instances
let tempChart = null;
let humidChart = null;
let gasChart = null;

// Data storage
const MAX_POINTS = 20;
let chartData = {
    labels: [],
    temp: [],
    humid: [],
    gas: []
};

// ============================================
// CREATE HORIZONTAL LINE PLUGIN (MANUAL)
// ============================================

const warningLinesPlugin = {
    id: 'warningLines',
    afterDraw: function(chart) {
        const ctx = chart.ctx;
        const chartArea = chart.chartArea;
        
        if (!chartArea) return;
        
        const yScale = chart.scales.y;
        const lines = chart.config.options.customLines || [];
        
        lines.forEach(line => {
            const yPixel = yScale.getPixelForValue(line.value);
            
            if (yPixel >= chartArea.top && yPixel <= chartArea.bottom) {
                ctx.save();
                
                ctx.strokeStyle = line.color;
                ctx.lineWidth = line.width || 2;
                ctx.setLineDash(line.dash || [6, 4]);
                ctx.beginPath();
                ctx.moveTo(chartArea.left, yPixel);
                ctx.lineTo(chartArea.right, yPixel);
                ctx.stroke();
                
                if (line.label) {
                    ctx.setLineDash([]);
                    
                    const text = line.label;
                    ctx.font = 'bold 10px Segoe UI, sans-serif';
                    const metrics = ctx.measureText(text);
                    const textWidth = metrics.width;
                    const padding = 8;
                    const labelX = chartArea.right - textWidth - padding - 10;
                    const labelY = yPixel - 6;
                    
                    ctx.fillStyle = 'rgba(10, 14, 23, 0.85)';
                    ctx.fillRect(labelX - 4, labelY - 14, textWidth + padding + 4, 22);
                    
                    ctx.fillStyle = line.color;
                    ctx.textAlign = 'left';
                    ctx.textBaseline = 'bottom';
                    ctx.fillText(text, labelX, labelY + 2);
                }
                
                ctx.restore();
            }
        });
    }
};

// Register plugin
Chart.register(warningLinesPlugin);

// ============================================
// INITIALIZE CHARTS
// ============================================

function initCharts() {
    console.log('🔄 Initializing charts...');

    // ==========================================
    // 1. TEMPERATURE CHART | 0-50°C
    // ==========================================
    const tempCtx = document.getElementById('tempChart').getContext('2d');
    
    tempChart = new Chart(tempCtx, {
        type: 'line',
        data: {
            labels: chartData.labels,
            datasets: [{
                label: 'Temperature (°C)',
                data: chartData.temp,
                borderColor: '#ff6b6b',
                backgroundColor: 'rgba(255, 107, 107, 0.15)',
                fill: true,
                tension: 0.4,
                pointRadius: 4,
                pointBackgroundColor: '#ff6b6b',
                borderWidth: 2
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            animation: {
                duration: 300
            },
            plugins: {
                legend: {
                    display: false
                }
            },
            scales: {
                x: {
                    ticks: {
                        color: '#556677',
                        font: { size: 9 },
                        maxTicksLimit: 10
                    },
                    grid: {
                        color: 'rgba(136, 153, 170, 0.08)'
                    }
                },
                y: {
                    beginAtZero: true,
                    max: 50,
                    ticks: {
                        color: '#556677',
                        font: { size: 9 },
                        stepSize: 10
                    },
                    grid: {
                        color: 'rgba(136, 153, 170, 0.08)'
                    }
                }
            },
            customLines: [
                {
                    value: 37,
                    color: '#f39c12',
                    dash: [6, 4],
                    label: '⚠️ WARNING 37°C'
                },
                {
                    value: 45,
                    color: '#e74c3c',
                    dash: [6, 4],
                    label: '🚨 DANGER 45°C'
                }
            ]
        }
    });

    // ==========================================
    // 2. HUMIDITY CHART | 0-100%
    // ==========================================
    const humidCtx = document.getElementById('humidChart').getContext('2d');
    
    humidChart = new Chart(humidCtx, {
        type: 'line',
        data: {
            labels: chartData.labels,
            datasets: [{
                label: 'Humidity (%)',
                data: chartData.humid,
                borderColor: '#4ecdc4',
                backgroundColor: 'rgba(78, 205, 196, 0.15)',
                fill: true,
                tension: 0.4,
                pointRadius: 4,
                pointBackgroundColor: '#4ecdc4',
                borderWidth: 2
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            animation: {
                duration: 300
            },
            plugins: {
                legend: {
                    display: false
                }
            },
            scales: {
                x: {
                    ticks: {
                        color: '#556677',
                        font: { size: 9 },
                        maxTicksLimit: 10
                    },
                    grid: {
                        color: 'rgba(136, 153, 170, 0.08)'
                    }
                },
                y: {
                    beginAtZero: true,
                    max: 100,
                    ticks: {
                        color: '#556677',
                        font: { size: 9 },
                        stepSize: 10
                    },
                    grid: {
                        color: 'rgba(136, 153, 170, 0.08)'
                    }
                }
            },
            customLines: [
                {
                    value: 30,
                    color: '#f39c12',
                    dash: [6, 4],
                    label: '⚠️ WARNING 30%'
                },
                {
                    value: 70,
                    color: '#f39c12',
                    dash: [6, 4],
                    label: '⚠️ WARNING 70%'
                }
            ]
        }
    });

    // ==========================================
    // 3. GAS MQ2 CHART | 0-1000
    // ==========================================
    const gasCtx = document.getElementById('gasChart').getContext('2d');
    
    gasChart = new Chart(gasCtx, {
        type: 'line',
        data: {
            labels: chartData.labels,
            datasets: [{
                label: 'Gas MQ2 (ADC)',
                data: chartData.gas,
                borderColor: '#f39c12',
                backgroundColor: 'rgba(243, 156, 18, 0.15)',
                fill: true,
                tension: 0.4,
                pointRadius: 4,
                pointBackgroundColor: '#f39c12',
                borderWidth: 2
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            animation: {
                duration: 300
            },
            plugins: {
                legend: {
                    display: false
                }
            },
            scales: {
                x: {
                    ticks: {
                        color: '#556677',
                        font: { size: 9 },
                        maxTicksLimit: 10
                    },
                    grid: {
                        color: 'rgba(136, 153, 170, 0.08)'
                    }
                },
                y: {
                    beginAtZero: true,
                    max: 1000,
                    ticks: {
                        color: '#556677',
                        font: { size: 9 },
                        stepSize: 100
                    },
                    grid: {
                        color: 'rgba(136, 153, 170, 0.08)'
                    }
                }
            },
            customLines: [
                {
                    value: 301,
                    color: '#f39c12',
                    dash: [6, 4],
                    label: '⚠️ WARNING 301'
                },
                {
                    value: 701,
                    color: '#e74c3c',
                    dash: [6, 4],
                    label: '🚨 DANGER 701'
                }
            ]
        }
    });

    console.log('✅ Charts initialized!');
}

// ============================================
// UPDATE CHARTS
// ============================================

function updateCharts(temp, humid, gas, timestamp) {
    let label = '--';
    if (timestamp) {
        const date = new Date(timestamp);
        label = date.toLocaleTimeString('ms-MY', {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        });
    }

    const tempNum = Number(temp) || 0;
    const humidNum = Number(humid) || 0;
    const gasNum = Number(gas) || 0;

    chartData.labels.push(label);
    chartData.temp.push(tempNum);
    chartData.humid.push(humidNum);
    chartData.gas.push(gasNum);

    if (chartData.labels.length > MAX_POINTS) {
        chartData.labels.shift();
        chartData.temp.shift();
        chartData.humid.shift();
        chartData.gas.shift();
    }

    if (tempChart) {
        tempChart.data.labels = chartData.labels;
        tempChart.data.datasets[0].data = chartData.temp;
        tempChart.update();
    }

    if (humidChart) {
        humidChart.data.labels = chartData.labels;
        humidChart.data.datasets[0].data = chartData.humid;
        humidChart.update();
    }

    if (gasChart) {
        gasChart.data.labels = chartData.labels;
        gasChart.data.datasets[0].data = chartData.gas;
        gasChart.update();
    }
}

// ============================================
// UPDATE DASHBOARD
// ============================================

function updateDashboard(data) {
    console.log('📊 updateDashboard called with:', data);
    
    if (!data) {
        console.warn('⚠️ No data received');
        return;
    }

    // Try both lowercase and uppercase field names
    const temp = data.temperature ?? data.Temperature ?? 0;
    const humid = data.humidity ?? data.Humidity ?? 0;
    const gas = data.gas ?? data.Gas ?? data.smoke ?? data.Smoke ?? 0;

    console.log(`   Temperature: ${temp}°C`);
    console.log(`   Humidity: ${humid}%`);
    console.log(`   Gas: ${gas} ADC`);

    // Update cards
    document.getElementById('tempValue').textContent = temp;
    const tempStatus = getTemperatureStatus(temp);
    document.getElementById('tempStatus').textContent = tempStatus.text;
    document.getElementById('tempStatus').className = 'card-status ' + tempStatus.class;

    document.getElementById('humidValue').textContent = humid;
    const humidStatus = getHumidityStatus(humid);
    document.getElementById('humidStatus').textContent = humidStatus.text;
    document.getElementById('humidStatus').className = 'card-status ' + humidStatus.class;

    document.getElementById('gasValue').textContent = gas;
    const gasStatus = getGasStatus(gas);
    document.getElementById('gasStatus').textContent = gasStatus.text;
    document.getElementById('gasStatus').className = 'card-status ' + gasStatus.class;

    // System status
    const systemStatus = getSystemStatus(temp, humid, gas);
    const statusDot = document.querySelector('.status-dot');
    const statusText = document.getElementById('statusText');
    statusDot.className = 'status-dot ' + systemStatus.class;
    statusText.textContent = systemStatus.text;
    
    if (systemStatus.class === 'danger') {
        statusText.style.color = '#e74c3c';
    } else if (systemStatus.class === 'warning') {
        statusText.style.color = '#f39c12';
    } else {
        statusText.style.color = '#27ae60';
    }

    const timestamp = data.timestamp || data.Timestamp || new Date().toISOString();
    document.getElementById('lastUpdate').textContent = 'Last Update: ' + formatTimestamp(timestamp);

    // Update charts
    updateCharts(temp, humid, gas, timestamp);
}

// ============================================
// LISTEN TO FIREBASE
// ============================================

function listenToFirebase() {
    console.log('🔄 Listening to Firebase at: sensor_data/latest');

    // Gunakan sensorRef dari firebase-config.js
    sensorRef.on('value', (snapshot) => {
        const data = snapshot.val();
        console.log('📥 Data received from Firebase:', data);
        
        if (data) {
            updateDashboard(data);
        } else {
            console.warn('⚠️ No data at sensor_data/latest');
            console.log('📌 Try adding data at: sensor_data/latest in Firebase');
            
            document.getElementById('tempValue').textContent = '--';
            document.getElementById('humidValue').textContent = '--';
            document.getElementById('gasValue').textContent = '--';
            document.getElementById('tempStatus').textContent = '--';
            document.getElementById('tempStatus').className = 'card-status';
            document.getElementById('humidStatus').textContent = '--';
            document.getElementById('humidStatus').className = 'card-status';
            document.getElementById('gasStatus').textContent = '--';
            document.getElementById('gasStatus').className = 'card-status';
            document.querySelector('.status-dot').className = 'status-dot';
            document.getElementById('statusText').textContent = 'Menunggu Data...';
            document.getElementById('statusText').style.color = '#8899aa';
        }
    }, (error) => {
        console.error('❌ Firebase error:', error);
        document.getElementById('statusText').textContent = '⚠️ Connection Error';
        document.getElementById('statusText').style.color = '#e74c3c';
    });
}

// ============================================
// INITIALIZATION
// ============================================

function init() {
    console.log('🚀 Starting Fire Monitoring System...');
    console.log('📋 Thresholds:');
    console.log('  Temperature: Normal <35°C | Warning 37-40°C | Danger ≥45°C');
    console.log('  Humidity: Normal 30-70% | Warning <30% or >70%');
    console.log('  Gas: Safe 0-300 | Warning 301-700 | Danger >700 ADC');

    initCharts();
    listenToFirebase();

    console.log('✅ System ready!');
    console.log('📌 Make sure data exists at: sensor_data/latest');
}

document.addEventListener('DOMContentLoaded', init);