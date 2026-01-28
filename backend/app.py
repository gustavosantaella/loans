from flask import Flask, request, jsonify
from flask_cors import CORS
import os
import logging
import io
from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
import sqlite3
from reportlab.lib.pagesizes import letter
from reportlab.pdfgen import canvas
from reportlab.lib import colors
from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer
from reportlab.lib.styles import getSampleStyleSheet
import openpyxl
from openpyxl.styles import Font, Alignment, PatternFill

app = Flask(__name__)
CORS(app)

# Logging configuration
logging.basicConfig(level=logging.INFO)
logger = app.logger

DB_PATH = os.path.join(os.path.dirname(__file__), 'loans.db')

def init_db():
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS clients (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            nombre TEXT NOT NULL,
            apellido TEXT NOT NULL,
            telefono TEXT,
            correo TEXT,
            nota TEXT
        )
    ''')
    
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS partners (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            nombre TEXT NOT NULL,
            nota TEXT
        )
    ''')
    
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS loans (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            client_id INTEGER,
            fecha TEXT,
            fecha_fin TEXT,
            monto REAL,
            porcentaje REAL,
            total REAL,
            status TEXT,
            parent_id INTEGER,
            partner_id INTEGER,
            partner_percentage REAL,
            partner_capital REAL,
            FOREIGN KEY (client_id) REFERENCES clients (id),
            FOREIGN KEY (parent_id) REFERENCES loans (id),
            FOREIGN KEY (partner_id) REFERENCES partners (id)
        )
    ''')

    try:
        cursor.execute('PRAGMA table_info(loans)')
        columns = [row[1] for row in cursor.fetchall()]
        if 'clientId' in columns and 'client_id' not in columns:
            cursor.execute('ALTER TABLE loans RENAME COLUMN clientId TO client_id')
        if 'fecha_fin' not in columns:
            cursor.execute('ALTER TABLE loans ADD COLUMN fecha_fin TEXT')
        if 'parent_id' not in columns:
            print("Migrating: Adding parent_id to loans table")
            cursor.execute('ALTER TABLE loans ADD COLUMN parent_id INTEGER')
            
        if 'active' not in columns:
            print("Migrating: Adding active to loans table")
            cursor.execute('ALTER TABLE loans ADD COLUMN active INTEGER DEFAULT 1')
            
        # Partner Migrations
        if 'partner_id' not in columns:
            print("Migrating: Adding partner_id to loans table")
            cursor.execute('ALTER TABLE loans ADD COLUMN partner_id INTEGER')
        if 'partner_percentage' not in columns:
            print("Migrating: Adding partner_percentage to loans table")
            cursor.execute('ALTER TABLE loans ADD COLUMN partner_percentage REAL')
        if 'partner_capital' not in columns:
            print("Migrating: Adding partner_capital to loans table")
            cursor.execute('ALTER TABLE loans ADD COLUMN partner_capital REAL')
            
    except Exception as e:
        logger.error(f"Migration error: {e}")

    cursor.execute('''
        CREATE TABLE IF NOT EXISTS payments (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            loan_id INTEGER,
            monto REAL,
            fecha TEXT,
            FOREIGN KEY (loan_id) REFERENCES loans (id)
        )
    ''')
    
    conn.commit()
    conn.close()

# API Clientes
@app.route('/api/clients', methods=['GET'])
def get_clients():
    try:
        conn = sqlite3.connect(DB_PATH)
        conn.row_factory = sqlite3.Row
        cursor = conn.cursor()
        cursor.execute('SELECT * FROM clients ORDER BY id DESC')
        clients = [dict(row) for row in cursor.fetchall()]
        conn.close()
        return jsonify(clients)
    except Exception as e:
        logger.error(f"Error getting clients: {e}")
        return jsonify({"error": str(e)}), 500

@app.route('/api/clients', methods=['POST'])
def add_client():
    try:
        data = request.json
        logger.info(f"Adding client: {data}")
        conn = sqlite3.connect(DB_PATH)
        cursor = conn.cursor()
        cursor.execute('''
            INSERT INTO clients (nombre, apellido, telefono, correo, nota)
            VALUES (?, ?, ?, ?, ?)
        ''', (data['nombre'], data['apellido'], data.get('telefono'), data.get('correo'), data.get('nota')))
        conn.commit()
        conn.close()
        return jsonify({"status": "success"}), 201
    except Exception as e:
        logger.error(f"Error adding client: {e}")
        return jsonify({"error": str(e)}), 500

@app.route('/api/clients/<int:client_id>', methods=['DELETE'])
def delete_client(client_id):
    try:
        conn = sqlite3.connect(DB_PATH)
        cursor = conn.cursor()
        # Delete loans and payments first
        cursor.execute('SELECT id FROM loans WHERE client_id = ?', (client_id,))
        loan_ids = [row[0] for row in cursor.fetchall()]
        for lid in loan_ids:
            cursor.execute('DELETE FROM payments WHERE loan_id = ?', (lid,))
        cursor.execute('DELETE FROM loans WHERE client_id = ?', (client_id,))
        cursor.execute('DELETE FROM clients WHERE id = ?', (client_id,))
        conn.commit()
        conn.close()
        return jsonify({"status": "success"})
    except Exception as e:
        logger.error(f"Error deleting client: {e}")
        return jsonify({"error": str(e)}), 500


# API Socios (Partners)
@app.route('/api/partners', methods=['GET'])
def get_partners():
    try:
        conn = sqlite3.connect(DB_PATH)
        conn.row_factory = sqlite3.Row
        cursor = conn.cursor()
        cursor.execute('SELECT * FROM partners ORDER BY id DESC')
        partners = [dict(row) for row in cursor.fetchall()]
        conn.close()
        return jsonify(partners)
    except Exception as e:
        logger.error(f"Error getting partners: {e}")
        return jsonify({"error": str(e)}), 500

@app.route('/api/partners', methods=['POST'])
def add_partner():
    try:
        data = request.json
        logger.info(f"Adding partner: {data}")
        conn = sqlite3.connect(DB_PATH)
        cursor = conn.cursor()
        cursor.execute('''
            INSERT INTO partners (nombre, nota)
            VALUES (?, ?)
        ''', (data['nombre'], data.get('nota')))
        conn.commit()
        conn.close()
        return jsonify({"status": "success"}), 201
    except Exception as e:
        logger.error(f"Error adding partner: {e}")
        return jsonify({"error": str(e)}), 500

@app.route('/api/partners/<int:partner_id>', methods=['DELETE'])
def delete_partner(partner_id):
    try:
        conn = sqlite3.connect(DB_PATH)
        cursor = conn.cursor()
        cursor.execute('DELETE FROM partners WHERE id = ?', (partner_id,))
        conn.commit()
        conn.close()
        return jsonify({"status": "success"})
    except Exception as e:
        logger.error(f"Error deleting partner: {e}")
        return jsonify({"error": str(e)}), 500

@app.route('/api/partners/<int:partner_id>/loans', methods=['GET'])
def get_partner_loans(partner_id):
    try:
        conn = sqlite3.connect(DB_PATH)
        conn.row_factory = sqlite3.Row
        cursor = conn.cursor()
        cursor.execute('''
            SELECT l.*, c.nombre as client_nombre, c.apellido as client_apellido 
            FROM loans l
            JOIN clients c ON l.client_id = c.id
            WHERE l.partner_id = ? 
            ORDER BY l.id DESC
        ''', (partner_id,))
        loans = [dict(row) for row in cursor.fetchall()]
        formatted_loans = []
        for loan in loans:
            formatted_loans.append({
                "id": loan["id"],
                "clientId": loan["client_id"],
                "clientName": f"{loan['client_nombre']} {loan['client_apellido']}",
                "fecha": loan["fecha"],
                "fechaFin": loan["fecha_fin"],
                "monto": loan["monto"],
                "porcentaje": loan["porcentaje"],
                "total": loan["total"],
                "status": loan["status"],
                "parentId": loan.get("parent_id"),
                "partnerId": loan.get("partner_id"),
                "partnerPercentage": loan.get("partner_percentage"),
                "partnerCapital": loan.get("partner_capital"),
                "active": loan.get("active", 1)
            })
        conn.close()
        return jsonify(formatted_loans)
    except Exception as e:
        logger.error(f"Error getting partner loans: {e}")
        return jsonify({"error": str(e)}), 500

# API Préstamos
@app.route('/api/clients/<int:client_id>/loans', methods=['GET'])
def get_loans(client_id):
    try:
        conn = sqlite3.connect(DB_PATH)
        conn.row_factory = sqlite3.Row
        cursor = conn.cursor()
        cursor.execute('SELECT * FROM loans WHERE client_id = ? ORDER BY id DESC', (client_id,))
        loans = [dict(row) for row in cursor.fetchall()]
        formatted_loans = []
        for loan in loans:
            formatted_loans.append({
                "id": loan["id"],
                "clientId": loan["client_id"],
                "fecha": loan["fecha"],
                "fechaFin": loan["fecha_fin"],
                "monto": loan["monto"],
                "porcentaje": loan["porcentaje"],
                "total": loan["total"],
                "status": loan["status"],
                "parentId": loan.get("parent_id"),
                "partnerId": loan.get("partner_id"),
                "partnerPercentage": loan.get("partner_percentage"),
                "partnerCapital": loan.get("partner_capital"),
                "active": loan.get("active", 1)
            })
        conn.close()
        return jsonify(formatted_loans)
    except Exception as e:
        logger.error(f"Error getting loans: {e}")
        return jsonify({"error": str(e)}), 500

@app.route('/api/loans', methods=['POST'])
def add_loan():
    try:
        data = request.json
        logger.info(f"Adding loan: {data}")
        conn = sqlite3.connect(DB_PATH)
        cursor = conn.cursor()
        cursor.execute('''
            INSERT INTO loans (client_id, fecha, fecha_fin, monto, porcentaje, total, status, parent_id, partner_id, partner_percentage, partner_capital, active)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ''', (
            data['clientId'], 
            data['fecha'], 
            data.get('fechaFin'), 
            data['monto'], 
            data['porcentaje'], 
            data['total'], 
            data['status'], 
            data.get('parentId'),
            data.get('partnerId'),
            data.get('partnerPercentage'),
            data.get('partnerCapital'),
            1 # Default active=1
        ))
        conn.commit()
        conn.close()
        return jsonify({"status": "success"}), 201
    except Exception as e:
        logger.error(f"Error adding loan: {e}")
        return jsonify({"error": str(e)}), 500

@app.route('/api/loans/<int:loan_id>', methods=['DELETE'])
def delete_loan(loan_id):
    try:
        conn = sqlite3.connect(DB_PATH)
        cursor = conn.cursor()
        cursor.execute('DELETE FROM payments WHERE loan_id = ?', (loan_id,))
        cursor.execute('DELETE FROM loans WHERE id = ?', (loan_id,))
        conn.commit()
        conn.close()
        return jsonify({"status": "success"})
    except Exception as e:
        logger.error(f"Error deleting loan: {e}")
        return jsonify({"error": str(e)}), 500

@app.route('/api/loans/<int:loan_id>', methods=['PUT'])
def update_loan(loan_id):
    try:
        data = request.json
        logger.info(f"Updating loan {loan_id}: {data}")
        conn = sqlite3.connect(DB_PATH)
        cursor = conn.cursor()
        
        # Build update query dynamically
        fields = []
        values = []
        allowed_fields = ['client_id', 'fecha', 'fecha_fin', 'monto', 'porcentaje', 'total', 'status', 'parent_id', 'partner_id', 'partner_percentage', 'partner_capital', 'active']
        
        # Map frontend keys (camelCase) to DB keys (snake_case)
        key_map = {
            'clientId': 'client_id',
            'fechaFin': 'fecha_fin',
            'parentId': 'parent_id',
            'partnerId': 'partner_id',
            'partnerPercentage': 'partner_percentage',
            'partnerCapital': 'partner_capital'
        }
        
        for key, value in data.items():
            db_key = key_map.get(key, key)
            if db_key in allowed_fields:
                fields.append(f"{db_key} = ?")
                values.append(value)
        
        if not fields:
             return jsonify({"error": "No valid fields to update"}), 400
             
        values.append(loan_id)
        query = f"UPDATE loans SET {', '.join(fields)} WHERE id = ?"
        
        cursor.execute(query, values)
        conn.commit()
        conn.close()
        return jsonify({"status": "success"})
    except Exception as e:
        logger.error(f"Error updating loan: {e}")
        return jsonify({"error": str(e)}), 500

# API Pagos
@app.route('/api/loans/<int:loan_id>/payments', methods=['GET'])
def get_payments(loan_id):
    try:
        conn = sqlite3.connect(DB_PATH)
        conn.row_factory = sqlite3.Row
        cursor = conn.cursor()
        cursor.execute('SELECT * FROM payments WHERE loan_id = ? ORDER BY id ASC', (loan_id,))
        payments = [dict(row) for row in cursor.fetchall()]
        conn.close()
        return jsonify(payments)
    except Exception as e:
        logger.error(f"Error getting payments: {e}")
        return jsonify({"error": str(e)}), 500

@app.route('/api/loans/<int:loan_id>/payments', methods=['POST'])
def add_payment(loan_id):
    try:
        data = request.json
        conn = sqlite3.connect(DB_PATH)
        cursor = conn.cursor()
        cursor.execute('''
            INSERT INTO payments (loan_id, monto, fecha)
            VALUES (?, ?, ?)
        ''', (loan_id, data['monto'], data['fecha']))
        
        cursor.execute('SELECT total FROM loans WHERE id = ?', (loan_id,))
        res = cursor.fetchone()
        if res:
            loan_total = res[0]
            cursor.execute('SELECT SUM(monto) FROM payments WHERE loan_id = ?', (loan_id,))
            total_paid = cursor.fetchone()[0] or 0
            if total_paid >= loan_total:
                cursor.execute('UPDATE loans SET status = ? WHERE id = ?', ('pagado', loan_id))
        
        conn.commit()
        conn.close()
        return jsonify({"status": "success"}), 201
    except Exception as e:
        logger.error(f"Error adding payment: {e}")
        return jsonify({"error": str(e)}), 500

@app.route('/api/payments/<int:payment_id>', methods=['DELETE'])
def delete_payment(payment_id):
    try:
        conn = sqlite3.connect(DB_PATH)
        cursor = conn.cursor()
        cursor.execute('SELECT loan_id FROM payments WHERE id = ?', (payment_id,))
        res = cursor.fetchone()
        if res:
            loan_id = res[0]
            cursor.execute('DELETE FROM payments WHERE id = ?', (payment_id,))
            cursor.execute('SELECT total FROM loans WHERE id = ?', (loan_id,))
            loan_total = cursor.fetchone()[0]
            cursor.execute('SELECT SUM(monto) FROM payments WHERE loan_id = ?', (loan_id,))
            total_paid = cursor.fetchone()[0] or 0
            if total_paid < loan_total:
                cursor.execute('UPDATE loans SET status = ? WHERE id = ?', ('pendiente', loan_id))
        conn.commit()
        conn.close()
        return jsonify({"status": "success"})
    except Exception as e:
        logger.error(f"Error deleting payment: {e}")
        return jsonify({"error": str(e)}), 500

# Report Generation
@app.route('/api/clients/<int:client_id>/report/pdf', methods=['GET'])
def generate_client_pdf(client_id):
    try:
        conn = sqlite3.connect(DB_PATH)
        conn.row_factory = sqlite3.Row
        cursor = conn.cursor()
        
        # Get Client
        cursor.execute('SELECT * FROM clients WHERE id = ?', (client_id,))
        client_row = cursor.fetchone()
        if not client_row:
            conn.close()
            return jsonify({"error": "Client not found"}), 404
        client = dict(client_row)
        
        # Get Loans
        cursor.execute('SELECT * FROM loans WHERE client_id = ? ORDER BY id ASC', (client_id,))
        loans = [dict(row) for row in cursor.fetchall()]
        
        conn.close()
        
        # Generate PDF
        buffer = io.BytesIO()
        doc = SimpleDocTemplate(buffer, pagesize=letter)
        elements = []
        styles = getSampleStyleSheet()
        
        # Title
        elements.append(Paragraph(f"Reporte de Cliente: {client['nombre']} {client['apellido']}", styles['Title']))
        elements.append(Paragraph(f"Teléfono: {client.get('telefono', 'N/A')} | Correo: {client.get('correo', 'N/A')}", styles['Normal']))
        elements.append(Spacer(1, 12))
        
        # Table Data
        data = [['ID', 'Fecha', 'Monto', 'Total', 'Estado', 'Activo']]
        total_monto = 0
        total_deuda = 0
        
        for loan in loans:
            m = loan['monto']
            t = loan['total']
            total_monto += m
            total_deuda += t
            
            data.append([
                str(loan['id']),
                loan['fecha'],
                f"${m:,.2f}",
                f"${t:,.2f}",
                loan['status'],
                'Sí' if loan.get('active', 1) else 'No'
            ])
            
        # Totals Row
        data.append([
            'TOTALES',
            '',
            f"${total_monto:,.2f}",
            f"${total_deuda:,.2f}",
            '',
            ''
        ])
            
        table = Table(data)
        table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.grey),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
            ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
            ('BACKGROUND', (0, 1), (-1, -1), colors.beige),
            ('GRID', (0, 0), (-1, -1), 1, colors.black),
            # Style for Totals Row
            ('BACKGROUND', (0, -1), (-1, -1), colors.lightgrey),
            ('FONTNAME', (0, -1), (-1, -1), 'Helvetica-Bold'),
        ]))
        elements.append(table)
        
        doc.build(elements)
        buffer.seek(0)
        
        return send_file(
            buffer,
            as_attachment=True,
            download_name=f"reporte_{client['nombre']}_{client['apellido']}.pdf",
            mimetype='application/pdf'
        )
        
    except Exception as e:
        logger.error(f"Error generating PDF: {e}")
        return jsonify({"error": str(e)}), 500

@app.route('/api/clients/<int:client_id>/report/excel', methods=['GET'])
def generate_client_excel(client_id):
    try:
        conn = sqlite3.connect(DB_PATH)
        conn.row_factory = sqlite3.Row
        cursor = conn.cursor()
        
        # Get Client
        cursor.execute('SELECT * FROM clients WHERE id = ?', (client_id,))
        client_row = cursor.fetchone()
        if not client_row:
            conn.close()
            return jsonify({"error": "Client not found"}), 404
        client = dict(client_row)
        
        # Get Loans
        cursor.execute('SELECT * FROM loans WHERE client_id = ? ORDER BY id ASC', (client_id,))
        loans = [dict(row) for row in cursor.fetchall()]
        
        conn.close()
        
        # Generate Excel
        wb = openpyxl.Workbook()
        ws = wb.active
        ws.title = "Reporte de Préstamos"
        
        # Header Info
        ws['A1'] = f"Reporte de Cliente: {client['nombre']} {client['apellido']}"
        ws['A1'].font = Font(bold=True, size=14)
        ws.merge_cells('A1:F1')
        
        ws['A2'] = f"Teléfono: {client.get('telefono', 'N/A')}"
        ws['A3'] = f"Correo: {client.get('correo', 'N/A')}"
        
        # Table Headers
        headers = ['ID', 'Fecha', 'Monto', 'Total', 'Estado', 'Activo']
        for col_num, header in enumerate(headers, 1):
            cell = ws.cell(row=5, column=col_num)
            cell.value = header
            cell.font = Font(bold=True, color="FFFFFF")
            cell.fill = PatternFill(start_color="4F81BD", end_color="4F81BD", fill_type="solid")
            cell.alignment = Alignment(horizontal="center")
            
        # Data
        total_monto = 0
        total_deuda = 0
        current_row = 6
        
        for loan in loans:
            m = loan['monto']
            t = loan['total']
            total_monto += m
            total_deuda += t
            
            ws.cell(row=current_row, column=1, value=loan['id'])
            ws.cell(row=current_row, column=2, value=loan['fecha'])
            ws.cell(row=current_row, column=3, value=m).number_format = '$#,##0.00'
            ws.cell(row=current_row, column=4, value=t).number_format = '$#,##0.00'
            ws.cell(row=current_row, column=5, value=loan['status'])
            ws.cell(row=current_row, column=6, value='Sí' if loan.get('active', 1) else 'No')
            current_row += 1
            
        # Totals Row
        ws.cell(row=current_row, column=1, value="TOTALES")
        ws.cell(row=current_row, column=3, value=total_monto).number_format = '$#,##0.00'
        ws.cell(row=current_row, column=4, value=total_deuda).number_format = '$#,##0.00'
        
        for col in range(1, 7):
            cell = ws.cell(row=current_row, column=col)
            cell.font = Font(bold=True)
            cell.fill = PatternFill(start_color="D3D3D3", end_color="D3D3D3", fill_type="solid")
            
        buffer = io.BytesIO()
        wb.save(buffer)
        buffer.seek(0)
        
        return send_file(
            buffer,
            as_attachment=True,
            download_name=f"reporte_{client['nombre']}_{client['apellido']}.xlsx",
            mimetype='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        )

    except Exception as e:
        logger.error(f"Error generating Excel: {e}")
        return jsonify({"error": str(e)}), 500

@app.route('/api/reports/all-loans/pdf', methods=['GET'])
def generate_general_pdf():
    try:
        conn = sqlite3.connect(DB_PATH)
        conn.row_factory = sqlite3.Row
        cursor = conn.cursor()
        
        # Get All Loans joined with Clients
        cursor.execute('''
            SELECT l.*, c.nombre, c.apellido 
            FROM loans l
            JOIN clients c ON l.client_id = c.id
            ORDER BY l.id DESC
        ''')
        loans = [dict(row) for row in cursor.fetchall()]
        
        conn.close()
        
        # Generate PDF
        buffer = io.BytesIO()
        doc = SimpleDocTemplate(buffer, pagesize=letter)
        elements = []
        styles = getSampleStyleSheet()
        
        # Title
        elements.append(Paragraph("Reporte General de Préstamos", styles['Title']))
        elements.append(Spacer(1, 12))
        
        # Table Data
        # Columns: ID, Cliente, Monto, Total, Estado
        data = [['ID', 'Cliente', 'Monto', 'Total', 'Estado']]
        total_monto = 0
        total_deuda = 0
        
        for loan in loans:
            m = loan['monto']
            t = loan['total']
            total_monto += m
            total_deuda += t
            
            data.append([
                str(loan['id']),
                f"{loan['nombre']} {loan['apellido']}",
                f"${m:,.2f}",
                f"${t:,.2f}",
                loan['status']
            ])
            
        # Totals Row
        data.append([
            'TOTALES',
            '',
            f"${total_monto:,.2f}",
            f"${total_deuda:,.2f}",
            ''
        ])
            
        table = Table(data)
        table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.grey),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
            ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
            ('BACKGROUND', (0, 1), (-1, -1), colors.beige),
            ('GRID', (0, 0), (-1, -1), 1, colors.black),
            # Style for Totals Row
            ('BACKGROUND', (0, -1), (-1, -1), colors.lightgrey),
            ('FONTNAME', (0, -1), (-1, -1), 'Helvetica-Bold'),
        ]))
        elements.append(table)
        
        doc.build(elements)
        buffer.seek(0)
        
        return send_file(
            buffer,
            as_attachment=True,
            download_name="reporte_general_prestamos.pdf",
            mimetype='application/pdf'
        )
        
    except Exception as e:
        logger.error(f"Error generating General PDF: {e}")
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    init_db()
    app.run(debug=True, port=5000)
