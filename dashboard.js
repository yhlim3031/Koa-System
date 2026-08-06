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
// CREATE HORIZONTAL LINE PLUGIN
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
                ctx.restore();
            }
        });
    }
};
Chart.register(warningLinesPlugin);

// ============================================
// INITIALIZE CHARTS
// ============================================
function initCharts() {
    console.log('🔄 Initializing charts...');

    // Temperature
    const tempCtx = document.getElementById('tempChart').getContext('2d');
    tempChart = new Chart(tempCtx, {
        type: 'line',
        data: { labels: chartData.labels, datasets: [{ label: 'Temperature (°C)', data: chartData.temp, borderColor: '#9b59b6', backgroundColor: 'rgba(155, 89, 182, 0.15)', fill: true, tension: 0.4, pointRadius: 4, pointBackgroundColor: '#9b59b6', borderWidth: 2 }] },
        options: {
            responsive: true, maintainAspectRatio: false, animation: { duration: 300 },
            plugins: { legend: { display: false } },
            scales: {
                x: { ticks: { color: '#556677', font: { size: 9 }, maxTicksLimit: 10 }, grid: { color: 'rgba(136, 153, 170, 0.08)' } },
                y: { beginAtZero: true, max: 50, ticks: { color: '#556677', font: { size: 9 }, stepSize: 10 }, grid: { color: 'rgba(136, 153, 170, 0.08)' } }
            },
            customLines: [{ value: 37, color: '#f39c12', dash: [6, 4] }, { value: 45, color: '#e74c3c', dash: [6, 4] }]
        }
    });

    // Humidity
    const humidCtx = document.getElementById('humidChart').getContext('2d');
    humidChart = new Chart(humidCtx, {
        type: 'line',
        data: { labels: chartData.labels, datasets: [{ label: 'Humidity (%)', data: chartData.humid, borderColor: '#00d2d3', backgroundColor: 'rgba(0, 210, 211, 0.15)', fill: true, tension: 0.4, pointRadius: 4, pointBackgroundColor: '#00d2d3', borderWidth: 2 }] },
        options: {
            responsive: true, maintainAspectRatio: false, animation: { duration: 300 },
            plugins: { legend: { display: false } },
            scales: {
                x: { ticks: { color: '#556677', font: { size: 9 }, maxTicksLimit: 10 }, grid: { color: 'rgba(136, 153, 170, 0.08)' } },
                y: { beginAtZero: true, max: 100, ticks: { color: '#556677', font: { size: 9 }, stepSize: 10 }, grid: { color: 'rgba(136, 153, 170, 0.08)' } }
            },
            customLines: [{ value: 70, color: '#f39c12', dash: [6, 4] }]
        }
    });

    // Gas
    const gasCtx = document.getElementById('gasChart').getContext('2d');
    gasChart = new Chart(gasCtx, {
        type: 'line',
        data: { labels: chartData.labels, datasets: [{ label: 'Gas MQ2 (ADC)', data: chartData.gas, borderColor: '#00b894', backgroundColor: 'rgba(0, 184, 148, 0.15)', fill: true, tension: 0.4, pointRadius: 4, pointBackgroundColor: '#00b894', borderWidth: 2 }] },
        options: {
            responsive: true, maintainAspectRatio: false, animation: { duration: 300 },
            plugins: { legend: { display: false } },
            scales: {
                x: { ticks: { color: '#556677', font: { size: 9 }, maxTicksLimit: 10 }, grid: { color: 'rgba(136, 153, 170, 0.08)' } },
                y: { beginAtZero: true, max: 1000, ticks: { color: '#556677', font: { size: 9 }, stepSize: 100 }, grid: { color: 'rgba(136, 153, 170, 0.08)' } }
            },
            customLines: [{ value: 301, color: '#f39c12', dash: [6, 4] }, { value: 701, color: '#e74c3c', dash: [6, 4] }]
        }
    });

    console.log('✅ Charts initialized!');
}

// ============================================
// UPDATE CHARTS
// ============================================
function updateCharts(temp, humid, gas) {
    const now = new Date();
    let label = now.toLocaleTimeString('en-GB', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' });

    const tempNum = Number(temp) || 0;
    const humidNum = Number(humid) || 0;
    const gasNum = Number(gas) || 0;

    chartData.labels.push(label);
    chartData.temp.push(tempNum);
    chartData.humid.push(humidNum);
    chartData.gas.push(gasNum);

    if (chartData.labels.length > MAX_POINTS) {
        chartData.labels.shift(); chartData.temp.shift(); chartData.humid.shift(); chartData.gas.shift();
    }

    if (tempChart) { tempChart.data.labels = chartData.labels; tempChart.data.datasets[0].data = chartData.temp; tempChart.update(); }
    if (humidChart) { humidChart.data.labels = chartData.labels; humidChart.data.datasets[0].data = chartData.humid; humidChart.update(); }
    if (gasChart) { gasChart.data.labels = chartData.labels; gasChart.data.datasets[0].data = chartData.gas; gasChart.update(); }

    updateLegendBoxes(temp, humid, gas);
}

// ============================================
// UPDATE LEGEND BOXES
// ============================================
function updateLegendBoxes(temp, humid, gas) {
    const tempVal = Number(temp) || 0;
    const tempLegend = document.getElementById('tempLegend');
    if (tempLegend) {
        tempLegend.innerHTML = 
            (tempVal >= 37 ? `<span class="legend-item active-warning">🟠 WARNING 37°C (⚠️ AKTIF)</span>` : `<span class="legend-item">🟠 WARNING 37°C</span>`) +
            (tempVal >= 45 ? `<span class="legend-item active-danger">🔴 DANGER 45°C (🚨 AKTIF)</span>` : `<span class="legend-item">🔴 DANGER 45°C</span>`);
    }

    const humidVal = Number(humid) || 0;
    const humidLegend = document.getElementById('humidLegend');
    if (humidLegend) {
        humidLegend.innerHTML = humidVal >= 70 ? `<span class="legend-item active-warning">🟠 WARNING 70% (⚠️ AKTIF)</span>` : `<span class="legend-item">🟠 WARNING 70%</span>`;
    }

    const gasVal = Number(gas) || 0;
    const gasLegend = document.getElementById('gasLegend');
    if (gasLegend) {
        gasLegend.innerHTML = 
            (gasVal >= 301 ? `<span class="legend-item active-warning">🟠 WARNING 301 (⚠️ AKTIF)</span>` : `<span class="legend-item">🟠 WARNING 301</span>`) +
            (gasVal > 700 ? `<span class="legend-item active-danger">🔴 DANGER 701 (🚨 AKTIF)</span>` : `<span class="legend-item">🔴 DANGER 701</span>`);
    }
}

// ============================================
// STATUS FUNCTIONS
// ============================================
function getTemperatureStatus(temp) {
    if (temp >= 45) return { text: '🚨 DANGER', class: 'danger' };
    if (temp >= 37) return { text: '⚠️ WARNING', class: 'warning' };
    return { text: '✅ Normal', class: 'normal' };
}
function getHumidityStatus(humid) {
    if (humid >= 70) return { text: '⚠️ WARNING', class: 'warning' };
    return { text: '✅ Normal', class: 'normal' };
}
function getGasStatus(gas) {
    if (gas > 700) return { text: '🚨 DANGER', class: 'danger' };
    if (gas >= 301) return { text: '⚠️ WARNING', class: 'warning' };
    return { text: '✅ Normal', class: 'normal' };
}
function getSystemStatus(temp, humid, gas) {
    const tempS = getTemperatureStatus(temp);
    const humidS = getHumidityStatus(humid);
    const gasS = getGasStatus(gas);
    
    if (tempS.class === 'danger' || gasS.class === 'danger') return { text: '🚨 DANGER', class: 'danger' };
    if (tempS.class === 'warning' || gasS.class === 'warning' || humidS.class === 'warning') return { text: '⚠️ Warning', class: 'warning' };
    return { text: '✅ Normal', class: 'normal' };
}

// ============================================
// UPDATE DASHBOARD
// ============================================
function updateDashboard(data) {
    if (!data) return;
    
    const temp = data.temperature ?? data.Temperature ?? 0;
    const humid = data.humidity ?? data.Humidity ?? 0;
    const gas = data.gas ?? data.Gas ?? data.smoke ?? data.Smoke ?? 0;

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
    const statusDot = document.getElementById('statusDot');
    const statusText = document.getElementById('statusText');
    statusDot.className = 'status-dot ' + systemStatus.class;
    statusText.textContent = systemStatus.text;
    statusText.style.color = systemStatus.class === 'danger' ? '#e74c3c' : systemStatus.class === 'warning' ? '#f39c12' : '#27ae60';

    const now = new Date();
    document.getElementById('lastUpdate').textContent = 'Last Update: ' + now.toLocaleString('en-GB', { hour12: false });

    updateCharts(temp, humid, gas);
}

// ============================================
// ★ EXPORT EXCEL (BORDER HITAM & WARNA STATUS) ★
// ============================================
function exportToExcel() {
    console.log('📊 Exporting to Excel...');
    
    const btn = document.querySelector('.btn-export');
    const originalText = btn.innerHTML;
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Loading...';
    btn.disabled = true;
    
    // TUKAR INI KEPADA FUNGSI AMBIL DATA SEBENAR ANDA
    getHistoryData((data) => {
        if (!data || data.length === 0) {
            alert('⚠️ Tiada data untuk di export. Tunggu ESP32 hantar data.');
            btn.innerHTML = originalText; btn.disabled = false;
            return;
        }
        
        const wb = XLSX.utils.book_new();
        const excelData = [];
        const now = new Date();
        const dateStr = now.toLocaleDateString('ms-MY');
        const timeStr = now.toLocaleTimeString('ms-MY', { hour12: false });
        
        excelData.push(['LAPORAN DATA SISTEM MONITORING PENGGERA KEBAKARAN']);
        excelData.push([`Tarikh: ${dateStr} | Masa: ${timeStr}`]);
        excelData.push(['Bil', 'Masa', 'Suhu (°C)', 'Kelembapan (%)', 'Gas (ADC)', 'Status']);
        
        let bil = 1;
        data.forEach(row => {
            const status = getTemperatureStatus(row.temperature); // Guna logik status
            let statusText = status.text.replace(/[^\w\s]/gi, '').trim(); // Buang Emoji
            if(statusText === 'DANGER') statusText = 'DANGER';
            else if(statusText === 'WARNING') statusText = 'WARNING';
            else statusText = 'NORMAL';

            excelData.push([
                bil++,
                row.timestamp.split(' ')[1],
                Number(row.temperature).toFixed(1),
                Number(row.humidity).toFixed(1),
                Math.round(row.gas),
                statusText 
            ]);
        });
        
        const ws = XLSX.utils.aoa_to_sheet(excelData);
        ws['!cols'] = [{ wch: 8 }, { wch: 15 }, { wch: 15 }, { wch: 18 }, { wch: 14 }, { wch: 20 }];
        ws['!merges'] = [{ s: { r: 0, c: 0 }, e: { r: 0, c: 5 } }, { s: { r: 1, c: 0 }, e: { r: 1, c: 5 } }];

        // ★ LOGIK BORDER & WARNA ★
        const lastRow = excelData.length - 1; 
        for (let R = 0; R <= lastRow; R++) {
            for (let C = 0; C <= 5; C++) {
                const cellAddress = XLSX.utils.encode_cell({ r: R, c: C });
                const cell = ws[cellAddress];
                if (!cell) continue; 

                if (!cell.s) cell.s = {};

                // 1. BORDER HITAM
                cell.s.border = {
                    top: { style: "thin", color: { rgb: "000000" } },
                    bottom: { style: "thin", color: { rgb: "000000" } },
                    left: { style: "thin", color: { rgb: "000000" } },
                    right: { style: "thin", color: { rgb: "000000" } }
                };

                // 2. GAYA TITLE & HEADER
                if (R === 0 || R === 1) {
                    cell.s.font = { bold: true, sz: 14 };
                    cell.s.alignment = { horizontal: "center", vertical: "center" };
                } else if (R === 2) {
                    cell.s.fill = { fgColor: { rgb: "4472C4" } }; 
                    cell.s.font = { bold: true, color: { rgb: "FFFFFF" }, sz: 12 }; 
                    cell.s.alignment = { horizontal: "center", vertical: "center" };
                } else if (R >= 3) {
                    // ★ ALIGN LEFT ★
                    cell.s.alignment = { horizontal: "left", vertical: "center" };

                    // ★ WARNA STATUS (Kolom F / Index 5) ★
                    if (C === 5) {
                        let statusVal = cell.v.toString().toLowerCase();
                        if (statusVal.includes('warning')) {
                            cell.s.fill = { fgColor: { rgb: "FFEB9C" } }; // Oren
                            cell.s.font = { color: { rgb: "9C5700" }, bold: true };
                        } else if (statusVal.includes('danger')) {
                            cell.s.fill = { fgColor: { rgb: "FFC7CE" } }; // Merah
                            cell.s.font = { color: { rgb: "9C0006" }, bold: true };
                        } else if (statusVal.includes('normal')) {
                            cell.s.fill = { fgColor: { rgb: "C6EFCE" } }; // Hijau
                            cell.s.font = { color: { rgb: "006100" } };
                        }
                    }
                }
            }
        }
        
        XLSX.utils.book_append_sheet(wb, ws, 'Laporan');
        XLSX.writeFile(wb, `Laporan_${dateStr.replace(/\//g, '-')}.xlsx`);
        
        btn.innerHTML = originalText;
        btn.disabled = false;
    });
}

// ============================================
// INITIALIZATION
// ============================================
// ⚠️ NOTA PENTING: Fungsi ini hanya dummy untuk tujuan DEMO. 
// Anda perlu sambungkan Firebase anda semula di sini.
function getHistoryData(callback) {
    // Simulasi dummy data untuk uji Export
    const dummyData = [
        { timestamp: '2026-08-06 09:00:00', temperature: 28.5, humidity: 65.0, gas: 120 },
        { timestamp: '2026-08-06 09:00:05', temperature: 45.0, humidity: 70.0, gas: 701 } // Danger
    ];
    callback(dummyData);
}

function init() {
    initCharts();
    
    // Sila pastikan Firebase `sensorRef.on` anda dipanggil semula di sini!
    // Contoh: listenToFirebase();
    
    // Simulasi data masuk untuk test Dashboard
    setTimeout(() => { updateDashboard({ temperature: 28.5, humidity: 65, gas: 120 }); }, 500);
    setTimeout(() => { updateDashboard({ temperature: 45.0, humidity: 70, gas: 700 }); }, 3000);
}

document.addEventListener('DOMContentLoaded', init);