import bcrypt from 'bcryptjs';
import { getDatabase, saveDatabase } from '../database/init.js';

class Admin {
  static create({ email, password, name }) {
    const db = getDatabase();
    const hashedPassword = bcrypt.hashSync(password, 12);
    
    db.run(
      'INSERT INTO admins (email, password, name) VALUES (?, ?, ?)',
      [email, hashedPassword, name]
    );
    
    const result = db.exec('SELECT last_insert_rowid() as id');
    saveDatabase();
    
    return { id: result[0].values[0][0], email, name };
  }

  static findByEmail(email) {
    const db = getDatabase();
    const result = db.exec('SELECT * FROM admins WHERE email = ?', [email]);
    
    if (!result.length || !result[0].values.length) return null;
    
    const columns = result[0].columns;
    const values = result[0].values[0];
    const admin = {};
    
    columns.forEach((col, idx) => {
      admin[col] = values[idx];
    });
    
    return admin;
  }

  static count() {
    const db = getDatabase();
    const result = db.exec('SELECT COUNT(*) as count FROM admins');
    return result[0].values[0][0];
  }

  static findById(id) {
    const db = getDatabase();
    const result = db.exec('SELECT id, email, name, role FROM admins WHERE id = ?', [id]);
    
    if (!result.length || !result[0].values.length) return null;
    
    const columns = result[0].columns;
    const values = result[0].values[0];
    const admin = {};
    
    columns.forEach((col, idx) => {
      admin[col] = values[idx];
    });
    
    return admin;
  }

  static comparePassword(password, hash) {
    return bcrypt.compareSync(password, hash);
  }
}

export default Admin;
