// ============================================
// DASHBOARD CONTROLLER - DENGAN LEGEND BOX
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
// CREATE HORIZONTAL LINE PLUGIN (TANPA LABEL)
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
                
                // Lukis line SAHAJA (tanpa label)
                ctx.strokeStyle = line.color;
                ctx.lineWidth = line.width || 2;
                ctx.setLineDash(line.dash || [6, 4]);
                ctx.beginPath();
                ctx.moveTo(chartArea.left, yPixel);
                ctx.lineTo(chartArea.right, yPixel);
                ctx.stroke();
                
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
                borderColor: '#9b59b6',
                backgroundColor: 'rgba(155, 89, 182, 0.15)',
                fill: true,
                tension: 0.4,
                pointRadius: 4,
                pointBackgroundColor: '#9b59b6',
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
                    dash: [6, 4]
                },
                {
                    value: 45,
                    color: '#e74c3c',
                    dash: [6, 4]
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
                borderColor: '#00d2d3',
                backgroundColor: 'rgba(0, 210, 211, 0.15)',
                fill: true,
                tension: 0.4,
                pointRadius: 4,
                pointBackgroundColor: '#00d2d3',
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
                    value: 70,
                    color: '#f39c12',
                    dash: [6, 4]
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
                borderColor: '#00b894',
                backgroundColor: 'rgba(0, 184, 148, 0.15)',
                fill: true,
                tension: 0.4,
                pointRadius: 4,
                pointBackgroundColor: '#00b894',
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
                    dash: [6, 4]
                },
                {
                    value: 701,
                    color: '#e74c3c',
                    dash: [6, 4]
                }
            ]
        }
    });

    console.log('✅ Charts initialized!');
    console.log('   📊 Temperature: 🟣 Purple (#9b59b6)');
    console.log('   📊 Humidity: 🔵 Cyan (#00d2d3)');
    console.log('   📊 Gas MQ2: 🟢 Lime (#00b894)');
}

// ============================================
// UPDATE CHARTS
// ============================================

function updateCharts(temp, humid, gas, timestamp) {
    // 24-HOUR FORMAT
    const now = new Date();
    let label = now.toLocaleTimeString('en-GB', {
        timeZone: 'Asia/Kuala_Lumpur',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
    });

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

    // ==========================================
    // UPDATE LEGEND BOXES
    // ==========================================
    updateLegendBoxes(temp, humid, gas);
}

// ==========================================
// UPDATE LEGEND BOXES (KOTAK DI BAWAH CHART)
// ==========================================

function updateLegendBoxes(temp, humid, gas) {
    // Temperature Legend
    const tempLegend = document.getElementById('tempLegend');
    if (tempLegend) {
        const tempVal = Number(temp) || 0;
        let tempHtml = '';
        
        // Warning line (37°C)
        if (tempVal >= 37 && tempVal <= 40) {
            tempHtml += `<span class="legend-item active-warning">🟠 WARNING 37°C (⚠️ AKTIF)</span>`;
        } else {
            tempHtml += `<span class="legend-item">🟠 WARNING 37°C</span>`;
        }
        
        // Danger line (45°C)
        if (tempVal >= 45) {
            tempHtml += `<span class="legend-item active-danger">🔴 DANGER 45°C (🚨 AKTIF)</span>`;
        } else {
            tempHtml += `<span class="legend-item">🔴 DANGER 45°C</span>`;
        }
        
        tempLegend.innerHTML = tempHtml;
    }

    // Humidity Legend
    const humidLegend = document.getElementById('humidLegend');
    if (humidLegend) {
        const humidVal = Number(humid) || 0;
        let humidHtml = '';
        
        if (humidVal >= 70) {
            humidHtml += `<span class="legend-item active-warning">🟠 WARNING 70% (⚠️ AKTIF)</span>`;
        } else {
            humidHtml += `<span class="legend-item">🟠 WARNING 70%</span>`;
        }
        
        humidLegend.innerHTML = humidHtml;
    }

    // Gas Legend
    const gasLegend = document.getElementById('gasLegend');
    if (gasLegend) {
        const gasVal = Number(gas) || 0;
        let gasHtml = '';
        
        // Warning line (301)
        if (gasVal >= 301 && gasVal <= 700) {
            gasHtml += `<span class="legend-item active-warning">🟠 WARNING 301 (⚠️ AKTIF)</span>`;
        } else {
            gasHtml += `<span class="legend-item">🟠 WARNING 301</span>`;
        }
        
        // Danger line (701)
        if (gasVal > 700) {
            gasHtml += `<span class="legend-item active-danger">🔴 DANGER 701 (🚨 AKTIF)</span>`;
        } else {
            gasHtml += `<span class="legend-item">🔴 DANGER 701</span>`;
        }
        
        gasLegend.innerHTML = gasHtml;
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

    // 24-HOUR FORMAT
    const now = new Date();
    const timestamp = now.toISOString();
    
    document.getElementById('lastUpdate').textContent = 'Last Update: ' + now.toLocaleString('en-GB', {
        timeZone: 'Asia/Kuala_Lumpur',
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
    });

    updateCharts(temp, humid, gas, timestamp);
}
// ============================================
// EXPORT TO EXCEL FUNCTION
// ============================================
function exportToExcel() {
    console.log('📊 Exporting to Excel...');
    
    const btn = document.querySelector('.btn-export');
    const originalText = btn.innerHTML;
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Loading...';
    btn.disabled = true;
    
    // Panggil fungsi anda untuk ambil data (getHistoryData)
    getHistoryData((data) => {
        if (!data || data.length === 0) {
            alert('⚠️ Tiada data untuk di export. Tunggu ESP32 hantar data.');
            btn.innerHTML = originalText;
            btn.disabled = false;
            return;
        }
        
        console.log(`📊 Found ${data.length} data points`);
        
        const wb = XLSX.utils.book_new();
        const excelData = [];
        
        // ==========================================
        // HEADER ROWS
        // ==========================================
        const now = new Date();
        const dateStr = now.toLocaleDateString('ms-MY', { day: '2-digit', month: '2-digit', year: 'numeric' });
        const timeStr = now.toLocaleTimeString('ms-MY', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false });
        
        excelData.push(['LAPORAN DATA SISTEM MONITORING PENGGERA KEBAKARAN']); // Row 1
        excelData.push([`Tarikh: ${dateStr} | Masa: ${timeStr}`]);             // Row 2
        excelData.push(['Bil', 'Masa', 'Suhu (°C)', 'Kelembapan (%)', 'Gas (ADC)', 'Status']); // Row 3
        
        // ==========================================
        // DATA ROWS
        // ==========================================
        let bil = 1;
        data.forEach(row => {
            const status = getStatus(row.temperature, row.humidity, row.gas);
            excelData.push([
                bil++,
                row.timestamp.split(' ')[1],
                Number(row.temperature).toFixed(1),
                Number(row.humidity).toFixed(1),
                Math.round(row.gas),
                status.text
            ]);
        });
        
        // ==========================================
        // CREATE WORKSHEET & GAYAKAN EXCEL
        // ==========================================
        const ws = XLSX.utils.aoa_to_sheet(excelData);
        
        // Tetapkan Lebar Column
        ws['!cols'] = [
            { wch: 8 },   // Bil
            { wch: 15 },  // Masa
            { wch: 15 },  // Suhu
            { wch: 18 },  // Kelembapan
            { wch: 14 },  // Gas
            { wch: 20 }   // Status
        ];
        
        // Merge Title & Date (A1:F1, A2:F2)
        ws['!merges'] = [
            { s: { r: 0, c: 0 }, e: { r: 0, c: 5 } },
            { s: { r: 1, c: 0 }, e: { r: 1, c: 5 } }
        ];

        // ==========================================
        // ★ PERINTAH PENTING: STYLE EXCEL ★
        // ==========================================
        const range = XLSX.utils.decode_range(ws['!ref']);
        
        for (let R = range.s.r; R <= range.e.r; R++) {
            for (let C = range.s.c; C <= range.e.c; C++) {
                const cellAddress = XLSX.utils.encode_cell({ r: R, c: C });
                const cell = ws[cellAddress];
                
                if (cell) {
                    if (!cell.s) cell.s = {};

                    // 1. BORDER HITAM UNTUK SEMUA SEL
                    cell.s.border = {
                        top: { style: "thin", color: { rgb: "000000" } },
                        bottom: { style: "thin", color: { rgb: "000000" } },
                        left: { style: "thin", color: { rgb: "000000" } },
                        right: { style: "thin", color: { rgb: "000000" } }
                    };

                    // 2. GAYA UNTUK BARIS HEADER (Row index 2)
                    if (R === 2) {
                        cell.s.fill = { fgColor: { rgb: "4472C4" } }; // Background Biru
                        cell.s.font = { bold: true, color: { rgb: "FFFFFF" }, sz: 12 }; // Putih & Bold
                        cell.s.alignment = { horizontal: "center", vertical: "center" };
                    } 
                    // 3. GAYA UNTUK TITLE & DATE (Row index 0 dan 1)
                    else if (R === 0 || R === 1) {
                        cell.s.font = { bold: true, sz: 14 };
                        cell.s.alignment = { horizontal: "center", vertical: "center" };
                    }
                    // 4. ★ DATA ALIGN LEFT (Row 3 dan seterusnya) ★
                    else if (R >= 3) {
                        cell.s.alignment = { horizontal: "left", vertical: "center" };
                    }
                }
            }
        }
        
        // ==========================================
        // SAVE FILE
        // ==========================================
        XLSX.utils.book_append_sheet(wb, ws, 'Laporan');
        const fileName = `Laporan_${dateStr.replace(/\//g, '-')}_${timeStr.replace(/:/g, '-')}.xlsx`;
        
        const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
        const blob = new Blob([wbout], { type: 'application/octet-stream' });
        
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = fileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(link.href);
        
        console.log('✅ Excel downloaded:', fileName);
        
        btn.innerHTML = originalText;
        btn.disabled = false;
    });
}
// ============================================
// GET STATUS HELPER
// ============================================

function getStatus(temp, humid, gas) {
    const tempStatus = getTemperatureStatus(temp);
    const humidStatus = getHumidityStatus(humid);
    const gasStatus = getGasStatus(gas);
    
    if (tempStatus.class === 'danger' || gasStatus.class === 'danger') {
        return { text: '🚨 DANGER', class: 'danger' };
    }
    
    if (tempStatus.class === 'warning' || 
        gasStatus.class === 'warning' || 
        humidStatus.class === 'warning') {
        return { text: '⚠️ Warning', class: 'warning' };
    }
    
    return { text: '✅ Normal', class: 'normal' };
}
// ============================================
// LISTEN TO FIREBASE
// ============================================

function listenToFirebase() {
    console.log('🔄 Listening to Firebase at: sensor_data/latest');

    sensorRef.on('value', (snapshot) => {
        const data = snapshot.val();
        console.log('📥 Data received from Firebase:', data);
        
        if (data) {
            updateDashboard(data);
        } else {
            console.warn('⚠️ No data at sensor_data/latest');
            
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
            
            // Reset legend
            document.getElementById('tempLegend').innerHTML = '<span class="legend-item">🟠 WARNING 37°C</span><span class="legend-item">🔴 DANGER 45°C</span>';
            document.getElementById('humidLegend').innerHTML = '<span class="legend-item">🟠 WARNING 70%</span>';
            document.getElementById('gasLegend').innerHTML = '<span class="legend-item">🟠 WARNING 301</span><span class="legend-item">🔴 DANGER 701</span>';
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
    console.log('  Humidity: Normal <70% | Warning ≥70%');
    console.log('  Gas: Safe 0-300 | Warning 301-700 | Danger >700 ADC');
    console.log('⏰ 24-hour format (HH:MM:SS)');

    initCharts();
    listenToFirebase();

    console.log('✅ System ready!');
}

document.addEventListener('DOMContentLoaded', init);