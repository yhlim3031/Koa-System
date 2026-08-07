from flask import Flask, request, send_file
from flask_cors import CORS
from openpyxl import Workbook
from openpyxl.styles import PatternFill, Border, Side, Alignment, Font
from openpyxl.chart import LineChart, Reference
import io

app = Flask(__name__)
CORS(app)

# Warna Excel standard
COLOR_NORMAL_BG = "FFC6EFCE"
COLOR_NORMAL_FONT = "FF006100"
COLOR_WARNING_BG = "FFFFEB9C"
COLOR_WARNING_FONT = "FF9C5700"
COLOR_DANGER_BG = "FFFFC7CE"
COLOR_DANGER_FONT = "FF9C0006"
COLOR_HEADER_BG = "FF4472C4"

# Helper untuk gaya sel data
def style_cell(cell, is_header=False, status=None):
    thin_border = Border(left=Side(style='thin'), right=Side(style='thin'), top=Side(style='thin'), bottom=Side(style='thin'))
    cell.border = thin_border
    
    if is_header:
        cell.fill = PatternFill(start_color=COLOR_HEADER_BG, end_color=COLOR_HEADER_BG, fill_type="solid")
        cell.font = Font(bold=True, color="FFFFFFFF", size=12)
        cell.alignment = Alignment(horizontal='center', vertical='center')
    else:
        cell.alignment = Alignment(horizontal='left', vertical='center')
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

# Helper untuk gaya tajuk chart (di merge)
def style_chart_header(ws, row, text):
    cell = ws.cell(row=row, column=1)
    cell.value = text
    cell.font = Font(bold=True, sz=14)
    cell.alignment = Alignment(horizontal='center', vertical='center')

@app.route('/generate-excel', methods=['POST'])
def generate_excel():
    data = request.json
    rows = data.get('data', [])
    date_str = data.get('date_str', 'Tidak diketahui')
    time_str = data.get('time_str', 'Tidak diketahui')
    
    row_count = len(rows)
    if row_count == 0:
        return "No data", 400

    wb = Workbook()
    
    # ==========================================
    # 1. SHEET: TEMPERATURE DATA
    # ==========================================
    ws_temp_data = wb.active
    ws_temp_data.title = "Temperature Data"
    ws_temp_data.append(["LAPORAN DATA SUHU (°C)"])
    ws_temp_data.append([f"Tarikh: {date_str} | Masa: {time_str}"])
    ws_temp_data.append(["Masa", "Suhu (°C)", "Status"])
    
    for cell in ws_temp_data[3]:
        style_cell(cell, is_header=True)

    for row in rows:
        t = row.get('temperature', 0)
        s = row.get('tempStatus', 'NORMAL')
        ws_temp_data.append([row.get('time'), f"{t:.1f}", s])
        
    for i in range(4, ws_temp_data.max_row + 1):
        status = ws_temp_data.cell(row=i, column=3).value
        for col in range(1, 4):
            style_cell(ws_temp_data.cell(row=i, column=col), status=status)
            
    ws_temp_data.column_dimensions['A'].width = 15
    ws_temp_data.column_dimensions['B'].width = 15
    ws_temp_data.column_dimensions['C'].width = 20

    # ==========================================
    # 2. SHEET: TEMPERATURE CHART
    # ==========================================
    ws_temp_chart = wb.create_sheet("Temperature Chart")
    
    # ★ Lebarkan kolum supaya header merge tidak terpotong ★
    ws_temp_chart.column_dimensions['A'].width = 25
    ws_temp_chart.column_dimensions['B'].width = 25
    ws_temp_chart.column_dimensions['C'].width = 25
    ws_temp_chart.column_dimensions['D'].width = 25
    ws_temp_chart.column_dimensions['E'].width = 25

    style_chart_header(ws_temp_chart, 1, "LAPORAN DATA SUHU (°C)")
    style_chart_header(ws_temp_chart, 2, f"Tarikh: {date_str} | Masa: {time_str}")
    # ★ Merge header sehingga E1 supaya teks panjang muat ★
    ws_temp_chart.merge_cells('A1:E1')
    ws_temp_chart.merge_cells('A2:E2')

    # ★ Rujukan Data Yang Tepat ★
    data_temp = Reference(ws_temp_data, min_col=2, min_row=3, max_row=row_count+2)
    cats_temp = Reference(ws_temp_data, min_col=1, min_row=3, max_row=row_count+2)
    
    chart_temp = LineChart()
    chart_temp.title = "Suhu (°C)"  # ★ Tajuk ringkas tanpa 30 Minit Terakhir ★
    chart_temp.style = 13
    chart_temp.add_data(data_temp, titles_from_data=True)
    chart_temp.set_categories(cats_temp)
    
    chart_temp.legend.position = 'b'  # Letak legenda di bawah

    # ★ PAKSI Y: 0-50 ★
    chart_temp.y_axis.scaling.min = 0
    chart_temp.y_axis.scaling.max = 50
    # ★ PAKSI X: Papar semua, pusing 90 darjah ★
    chart_temp.x_axis.auto = False
    chart_temp.x_axis.tickLblPos = 'low'
    chart_temp.x_axis.tickLblRot = 90
    
    chart_temp.width = 30
    chart_temp.height = 15

    ws_temp_chart.add_chart(chart_temp, "A4")

    # ==========================================
    # 3. SHEET: HUMIDITY DATA
    # ==========================================
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

    for i in range(4, ws_humid_data.max_row + 1):
        status = ws_humid_data.cell(row=i, column=3).value
        for col in range(1, 4):
            style_cell(ws_humid_data.cell(row=i, column=col), status=status)
            
    ws_humid_data.column_dimensions['A'].width = 15
    ws_humid_data.column_dimensions['B'].width = 18
    ws_humid_data.column_dimensions['C'].width = 20

    # ==========================================
    # 4. SHEET: HUMIDITY CHART
    # ==========================================
    ws_humid_chart = wb.create_sheet("Humidity Chart")
    
    ws_humid_chart.column_dimensions['A'].width = 25
    ws_humid_chart.column_dimensions['B'].width = 25
    ws_humid_chart.column_dimensions['C'].width = 25
    ws_humid_chart.column_dimensions['D'].width = 25
    ws_humid_chart.column_dimensions['E'].width = 25

    style_chart_header(ws_humid_chart, 1, "LAPORAN DATA KELEMBAPAN (%)")
    style_chart_header(ws_humid_chart, 2, f"Tarikh: {date_str} | Masa: {time_str}")
    ws_humid_chart.merge_cells('A1:E1')
    ws_humid_chart.merge_cells('A2:E2')

    # ★ Rujukan Data Humid ★
    data_humid = Reference(ws_humid_data, min_col=2, min_row=3, max_row=row_count+2)
    
    chart_humid = LineChart()
    chart_humid.title = "Kelembapan (%)"
    chart_humid.style = 12
    chart_humid.add_data(data_humid, titles_from_data=True)
    chart_humid.set_categories(cats_temp) # Guna paksi X yang sama
    chart_humid.legend.position = 'b'

    chart_humid.y_axis.scaling.min = 0
    chart_humid.y_axis.scaling.max = 100
    
    chart_humid.x_axis.auto = False
    chart_humid.x_axis.tickLblPos = 'low'
    chart_humid.x_axis.tickLblRot = 90
    
    chart_humid.width = 30
    chart_humid.height = 15

    ws_humid_chart.add_chart(chart_humid, "A4")

    # ==========================================
    # 5. SHEET: GAS DATA
    # ==========================================
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

    for i in range(4, ws_gas_data.max_row + 1):
        status = ws_gas_data.cell(row=i, column=3).value
        for col in range(1, 4):
            style_cell(ws_gas_data.cell(row=i, column=col), status=status)
            
    ws_gas_data.column_dimensions['A'].width = 15
    ws_gas_data.column_dimensions['B'].width = 14
    ws_gas_data.column_dimensions['C'].width = 20

    # ==========================================
    # 6. SHEET: GAS CHART
    # ==========================================
    ws_gas_chart = wb.create_sheet("Gas Chart")
    
    ws_gas_chart.column_dimensions['A'].width = 25
    ws_gas_chart.column_dimensions['B'].width = 25
    ws_gas_chart.column_dimensions['C'].width = 25
    ws_gas_chart.column_dimensions['D'].width = 25
    ws_gas_chart.column_dimensions['E'].width = 25

    style_chart_header(ws_gas_chart, 1, "LAPORAN DATA GAS (ADC)")
    style_chart_header(ws_gas_chart, 2, f"Tarikh: {date_str} | Masa: {time_str}")
    ws_gas_chart.merge_cells('A1:E1')
    ws_gas_chart.merge_cells('A2:E2')

    # ★ Rujukan Data Gas ★
    data_gas = Reference(ws_gas_data, min_col=2, min_row=3, max_row=row_count+2)
    
    chart_gas = LineChart()
    chart_gas.title = "Gas (ADC)"
    chart_gas.style = 11
    chart_gas.add_data(data_gas, titles_from_data=True)
    chart_gas.set_categories(cats_temp)
    chart_gas.legend.position = 'b'

    chart_gas.y_axis.scaling.min = 0
    chart_gas.y_axis.scaling.max = 1000
    
    chart_gas.x_axis.auto = False
    chart_gas.x_axis.tickLblPos = 'low'
    chart_gas.x_axis.tickLblRot = 90
    
    chart_gas.width = 30
    chart_gas.height = 15

    ws_gas_chart.add_chart(chart_gas, "A4")

    # ==========================================
    # SIMPAN DAN HANTAR
    # ==========================================
    output = io.BytesIO()
    wb.save(output)
    output.seek(0)
    
    return send_file(output, download_name=f"Laporan_Excel_{date_str.replace('/', '-')}.xlsx", as_attachment=True, mimetype='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)