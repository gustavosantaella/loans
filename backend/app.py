from flask import Flask, request, jsonify
from flask_cors import CORS
import sqlite3
import os
import logging

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
            FOREIGN KEY (client_id) REFERENCES clients (id),
            FOREIGN KEY (parent_id) REFERENCES loans (id)
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
                "parentId": loan.get("parent_id")
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
            INSERT INTO loans (client_id, fecha, fecha_fin, monto, porcentaje, total, status, parent_id)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        ''', (data['clientId'], data['fecha'], data.get('fechaFin'), data['monto'], data['porcentaje'], data['total'], data['status'], data.get('parentId')))
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

if __name__ == '__main__':
    init_db()
    app.run(debug=True, port=5000)
