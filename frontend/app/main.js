const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const Database = require('better-sqlite3');

let mainWindow;
let db;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false
    }
  });

  // During development, we might use a dev server. For production, we load the index.html.
  if (process.env.NODE_ENV === 'development') {
    mainWindow.loadURL('http://localhost:4200');
  } else {
    mainWindow.loadFile(path.join(__dirname, 'dist', 'app', 'browser', 'index.html'));
  }

  mainWindow.on('closed', function () {
    mainWindow = null;
  });
}

function initDb() {
  const dbPath = path.join(app.getPath('userData'), 'loans.db');
  db = new Database(dbPath);
  
  // Create tables
  db.prepare(`
    CREATE TABLE IF NOT EXISTS clients (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nombre TEXT NOT NULL,
      apellido TEXT NOT NULL,
      telefono TEXT,
      correo TEXT,
      nota TEXT
    )
  `).run();

  db.prepare(`
    CREATE TABLE IF NOT EXISTS loans (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      client_id INTEGER,
      fecha TEXT,
      monto REAL,
      porcentaje REAL,
      total REAL,
      status TEXT,
      FOREIGN KEY(client_id) REFERENCES clients(id)
    )
  `).run();
}

app.on('ready', () => {
  initDb();
  createWindow();
});

app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit();
});

app.on('activate', function () {
  if (mainWindow === null) createWindow();
});

// IPC Handlers
ipcMain.handle('get-clients', async () => {
  return db.prepare('SELECT * FROM clients').all();
});

ipcMain.handle('add-client', async (event, client) => {
  const info = db.prepare('INSERT INTO clients (nombre, apellido, telefono, correo, nota) VALUES (?, ?, ?, ?, ?)')
    .run(client.nombre, client.apellido, client.telefono, client.correo, client.nota);
  return { id: info.lastInsertRowid };
});

ipcMain.handle('get-loans', async (event, clientId) => {
  return db.prepare('SELECT * FROM loans WHERE client_id = ?').all(clientId);
});

ipcMain.handle('add-loan', async (event, loan) => {
  const info = db.prepare('INSERT INTO loans (client_id, fecha, monto, porcentaje, total, status) VALUES (?, ?, ?, ?, ?, ?)')
    .run(loan.clientId, loan.fecha, loan.monto, loan.porcentaje, loan.total, loan.status);
  return { id: info.lastInsertRowid };
});
