from flask import Flask, request, send_file
from flask_cors import CORS  # Aktifkan CORS
from openpyxl import Workbook
from openpyxl.styles import PatternFill, Border, Side, Alignment, Font
from openpyxl.chart import LineChart, Reference
import io
import json

app = Flask(__name__)
CORS(app)  # Benarkan akses dari mana-mana domain (termasuk localhost)

# Warna Excel standard (ARGB format)
COLOR_NORMAL_BG = "FFC6EFCE"
COLOR_NORMAL_FONT = "FF006100"
COLOR_WARNING_BG = "FFFFEB9C"
COLOR_WARNING_FONT = "FF9C5700"
COLOR_DANGER_BG = "FFFFC7CE"
COLOR_DANGER_FONT = "FF9C0006"
COLOR_HEADER_BG = "FF4472C4"

# Helper untuk gaya sel (Border, warna background, align left)
def style_cell(cell, is_header=False, status=None):
    thin_border = Border(left=Side(style='thin'), right=Side(style='thin'), top=Side(style='thin'), bottom=Side(style='thin'))
    cell.border = thin_border
    
    if is_header:
        cell.fill = PatternFill(start_color=COLOR_HEADER_BG, end_color=COLOR_HEADER_BG, fill_type="solid")
        cell.font = Font(bold=True, color="FFFFFFFF", size=12)
        cell.alignment = Alignment(horizontal='center', vertical='center')
    else:
        cell.alignment = Alignment(horizontal='left', vertical='center') # <-- Align Left
        if status:
            if status == "WARNING":
                cell.fill = PatternFill(start_color=COLOR_WARNING_BG, end_color=COLOR_WARNING_BG, fill_type="solid")
                cell.font = Font(bold=True, color=COLOR_WARNING_FONT)
            elif status == "DANGER":
                cell.fill = PatternFill(start_color=COLOR_DANGER_BG, end_color=COLOR_DANGER_BG, fill_type="solid")
                cell.font = Font(bold=True, color=COLOR_DANGER_FONT)
            else: # NORMAL
                cell.fill = PatternFill(start_color=COLOR_NORMAL_BG, end_color=COLOR_NORMAL_BG, fill_type="solid")
                cell.font = Font(bold=True, color=COLOR_NORMAL_FONT)

@app.route('/generate-excel', methods=['POST'])
def generate_excel():
    data = request.json
    rows = data.get('data', [])
    date_str = data.get('date_str', 'Tidak diketahui')
    time_str = data.get('time_str', 'Tidak diketahui')

    wb = Workbook()
    
    # --- 1. SHEET TEMPERATURE DATA ---
    ws_temp_data = wb.active
    ws_temp_data.title = "Temperature Data"
    ws_temp_data.append(["LAPORAN DATA SUHU (°C)"])
    ws_temp_data.append([f"Tarikh: {date_str} | Masa: {time_str}"])
    ws_temp_data.append(["Masa", "Suhu (°C)", "Status"])
    
    # Style Header
    for cell in ws_temp_data[3]:
        style_cell(cell, is_header=True)

    for row in rows:
        t = row.get('temperature', 0)
        s = row.get('tempStatus', 'NORMAL')
        ws_temp_data.append([row.get('time'), f"{t:.1f}", s])
        
    # ★ PERUBAHAN PENTING: guna .max_row dan bukannya len() ★
    for i in range(4, ws_temp_data.max_row + 1):
        status = ws_temp_data.cell(row=i, column=3).value
        for col in range(1, 4):
            style_cell(ws_temp_data.cell(row=i, column=col), status=status)
            
    ws_temp_data.column_dimensions['A'].width = 15
    ws_temp_data.column_dimensions['B'].width = 15
    ws_temp_data.column_dimensions['C'].width = 20

    # --- 2. SHEET TEMPERATURE CHART ---
    ws_temp_chart = wb.create_sheet("Temperature Chart")
    chart_temp = LineChart()
    chart_temp.title = "Graf Suhu (30 Minit Terakhir)"
    chart_temp.style = 13
    data_temp = Reference(ws_temp_data, min_col=2, min_row=3, max_row=len(rows)+2)
    cats_temp = Reference(ws_temp_data, min_col=1, min_row=3, max_row=len(rows)+2)
    chart_temp.add_data(data_temp, titles_from_data=True)
    chart_temp.set_categories(cats_temp)
    ws_temp_chart.add_chart(chart_temp, "A1")

    # --- 3. SHEET HUMIDITY DATA ---
    ws_humid_data = wb.create_sheet("Humidity Data")
    ws_humid_data.append(["LAPORAN DATA KELEMBAPAN (%)"])
    ws_humid_data.append([f"Tarikh: {date_str} | Masa: {time_str}"])
    ws_humid_data.append(["Masa", "Kelembapan (%)", "Status"])
    for cell in ws_humid_data[3]:
        style_cell(cell, is_header=True)

    for row in rows:
        h = row.get('humidity', 0)
        s = row.get('humidStatus', 'NORMAL')
        ws_humid_data.append([row.get('time'), f"{h:.1f}", s])

    # ★ PERUBAHAN PENTING: guna .max_row dan bukannya len() ★
    for i in range(4, ws_humid_data.max_row + 1):
        status = ws_humid_data.cell(row=i, column=3).value
        for col in range(1, 4):
            style_cell(ws_humid_data.cell(row=i, column=col), status=status)
            
    ws_humid_data.column_dimensions['A'].width = 15
    ws_humid_data.column_dimensions['B'].width = 18
    ws_humid_data.column_dimensions['C'].width = 20

    # --- 4. SHEET HUMIDITY CHART ---
    ws_humid_chart = wb.create_sheet("Humidity Chart")
    chart_humid = LineChart()
    chart_humid.title = "Graf Kelembapan (30 Minit Terakhir)"
    chart_humid.style = 12
    data_humid = Reference(ws_humid_data, min_col=2, min_row=3, max_row=len(rows)+2)
    chart_humid.add_data(data_humid, titles_from_data=True)
    chart_humid.set_categories(cats_temp) # Guna paksi masa yang sama
    ws_humid_chart.add_chart(chart_humid, "A1")

    # --- 5. SHEET GAS DATA ---
    ws_gas_data = wb.create_sheet("Gas Data")
    ws_gas_data.append(["LAPORAN DATA GAS (ADC)"])
    ws_gas_data.append([f"Tarikh: {date_str} | Masa: {time_str}"])
    ws_gas_data.append(["Masa", "Gas (ADC)", "Status"])
    for cell in ws_gas_data[3]:
        style_cell(cell, is_header=True)

    for row in rows:
        g = row.get('gas', 0)
        s = row.get('gasStatus', 'NORMAL')
        ws_gas_data.append([row.get('time'), round(g), s])

    # ★ PERUBAHAN PENTING: guna .max_row dan bukannya len() ★
    for i in range(4, ws_gas_data.max_row + 1):
        status = ws_gas_data.cell(row=i, column=3).value
        for col in range(1, 4):
            style_cell(ws_gas_data.cell(row=i, column=col), status=status)
            
    ws_gas_data.column_dimensions['A'].width = 15
    ws_gas_data.column_dimensions['B'].width = 14
    ws_gas_data.column_dimensions['C'].width = 20

    # --- 6. SHEET GAS CHART ---
    ws_gas_chart = wb.create_sheet("Gas Chart")
    chart_gas = LineChart()
    chart_gas.title = "Graf Gas (30 Minit Terakhir)"
    chart_gas.style = 11
    data_gas = Reference(ws_gas_data, min_col=2, min_row=3, max_row=len(rows)+2)
    chart_gas.add_data(data_gas, titles_from_data=True)
    chart_gas.set_categories(cats_temp)
    ws_gas_chart.add_chart(chart_gas, "A1")

    # --- SIMPAN KE MEMORI DAN HANTAR BALIK ---
    output = io.BytesIO()
    wb.save(output)
    output.seek(0)
    
    return send_file(output, download_name=f"Laporan_Excel_{date_str.replace('/', '-')}.xlsx", as_attachment=True, mimetype='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)