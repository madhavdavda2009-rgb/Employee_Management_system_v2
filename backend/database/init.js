import initSqlJs from 'sql.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbPath = path.join(__dirname, '..', 'data', 'ems.db');

let SQL;
let db;

async function initDatabase() {
  SQL = await initSqlJs();
  
  if (fs.existsSync(dbPath)) {
    const buffer = fs.readFileSync(dbPath);
    db = new SQL.Database(buffer);
    db.run('PRAGMA foreign_keys = ON');
    migrateDatabase();
  } else {
    db = new SQL.Database();
    db.run('PRAGMA foreign_keys = ON');
    
    db.run(`
      CREATE TABLE admins (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        name TEXT NOT NULL,
        role TEXT DEFAULT 'admin',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE employees (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        employee_id TEXT UNIQUE NOT NULL,
        name TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        phone TEXT NOT NULL,
        department TEXT NOT NULL,
        designation TEXT NOT NULL,
        joining_date DATE NOT NULL,
        salary REAL NOT NULL,
        face_encoding TEXT NOT NULL,
        profile_picture TEXT,
        password TEXT,
        is_active INTEGER DEFAULT 1,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE attendance (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        employee_id INTEGER NOT NULL,
        date DATE NOT NULL,
        check_in DATETIME,
        status TEXT NOT NULL CHECK(status IN ('Present', 'Absent', 'Late')),
        confidence REAL,
        marked_by TEXT DEFAULT 'System' CHECK(marked_by IN ('System', 'Admin')),
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE,
        UNIQUE(employee_id, date)
      );

      CREATE INDEX idx_employee_id ON employees(employee_id);
      CREATE INDEX idx_employee_email ON employees(email);
      CREATE INDEX idx_attendance_date ON attendance(date);
      CREATE INDEX idx_attendance_employee ON attendance(employee_id, date);
    `);
    
    saveDatabase();
  }
  
  console.log('Database initialized successfully');
}

function migrateDatabase() {
  const employeesInfo = db.exec('PRAGMA table_info(employees)');
  const employeeColumns = employeesInfo[0]?.values.map(column => column[1]) || [];
  let changed = false;

  if (!employeeColumns.includes('password')) {
    db.run('ALTER TABLE employees ADD COLUMN password TEXT');
    changed = true;
  }

  if (!employeeColumns.includes('profile_picture')) {
    db.run('ALTER TABLE employees ADD COLUMN profile_picture TEXT');
    changed = true;
  }

  if (changed) {
    saveDatabase();
  }
}

function saveDatabase() {
  const data = db.export();
  const buffer = Buffer.from(data);
  const dir = path.dirname(dbPath);
  
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  
  fs.writeFileSync(dbPath, buffer);
}

function getDatabase() {
  return db;
}

await initDatabase();

export { getDatabase, saveDatabase };
