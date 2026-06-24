import { getDatabase, saveDatabase } from '../database/init.js';
import bcrypt from 'bcryptjs';

class Employee {
  static generatePassword(length = 10) {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!@#$';
    let password = '';

    for (let index = 0; index < length; index++) {
      password += chars[Math.floor(Math.random() * chars.length)];
    }

    return password;
  }

  static create(data) {
    const db = getDatabase();
    const plainPassword = data.password || this.generatePassword();
    const hashedPassword = bcrypt.hashSync(plainPassword, 12);
    
    db.run(
      `INSERT INTO employees (employee_id, name, email, phone, department, designation, joining_date, salary, face_encoding, password, is_active)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        data.employeeId,
        data.name,
        data.email,
        data.phone,
        data.department,
        data.designation,
        data.joiningDate,
        data.salary,
        JSON.stringify(data.faceEncoding),
        hashedPassword,
        data.isActive === false ? 0 : 1
      ]
    );
    
    const result = db.exec('SELECT last_insert_rowid() as id');
    saveDatabase();
    
    return {
      id: result[0].values[0][0],
      ...data,
      password: plainPassword,
      isActive: data.isActive !== false
    };
  }

  static findAll(filters = {}) {
    const db = getDatabase();
    let query = 'SELECT * FROM employees';
    const clauses = [];
    const params = [];

    if (filters.status === 'active') {
      clauses.push('is_active = 1');
    } else if (filters.status === 'inactive') {
      clauses.push('is_active = 0');
    }

    if (filters.department) {
      clauses.push('department = ?');
      params.push(filters.department);
    }

    if (filters.search) {
      clauses.push('(name LIKE ? OR employee_id LIKE ? OR email LIKE ?)');
      const searchPattern = `%${filters.search}%`;
      params.push(searchPattern, searchPattern, searchPattern);
    }

    if (clauses.length) {
      query += ' WHERE ' + clauses.join(' AND ');
    }

    const result = db.exec(query, params);
    
    if (!result.length || !result[0].values.length) return [];
    
    const columns = result[0].columns;
    return result[0].values.map(values => {
      const emp = {};
      columns.forEach((col, idx) => {
        emp[col] = values[idx];
      });
      const { password, ...safeEmployee } = emp;
      
      return {
        ...safeEmployee,
        _id: safeEmployee.id,
        employeeId: safeEmployee.employee_id,
        joiningDate: safeEmployee.joining_date,
        isActive: safeEmployee.is_active === 1,
        faceEncoding: JSON.parse(safeEmployee.face_encoding)
      };
    });
  }

  static findById(id) {
    const db = getDatabase();
    const result = db.exec('SELECT * FROM employees WHERE id = ?', [id]);
    
    if (!result.length || !result[0].values.length) return null;
    
    const columns = result[0].columns;
    const values = result[0].values[0];
    const emp = {};
    
    columns.forEach((col, idx) => {
      emp[col] = values[idx];
    });
    const { password, ...safeEmployee } = emp;
    
    return {
      ...safeEmployee,
      _id: safeEmployee.id,
      employeeId: safeEmployee.employee_id,
      joiningDate: safeEmployee.joining_date,
      isActive: safeEmployee.is_active === 1,
      faceEncoding: JSON.parse(safeEmployee.face_encoding)
    };
  }

  static findByEmail(email) {
    const db = getDatabase();
    const result = db.exec('SELECT * FROM employees WHERE email = ?', [email]);

    if (!result.length || !result[0].values.length) return null;

    const columns = result[0].columns;
    const values = result[0].values[0];
    const emp = {};

    columns.forEach((col, idx) => {
      emp[col] = values[idx];
    });

    return {
      ...emp,
      _id: emp.id,
      employeeId: emp.employee_id,
      joiningDate: emp.joining_date,
      isActive: emp.is_active === 1,
      faceEncoding: JSON.parse(emp.face_encoding)
    };
  }

  static update(id, data) {
    const db = getDatabase();
    const fields = [];
    const values = [];

    if (data.name) { fields.push('name = ?'); values.push(data.name); }
    if (data.email) { fields.push('email = ?'); values.push(data.email); }
    if (data.phone) { fields.push('phone = ?'); values.push(data.phone); }
    if (data.department) { fields.push('department = ?'); values.push(data.department); }
    if (data.designation) { fields.push('designation = ?'); values.push(data.designation); }
    if (data.joiningDate) { fields.push('joining_date = ?'); values.push(data.joiningDate); }
    if (data.salary) { fields.push('salary = ?'); values.push(data.salary); }
    if (typeof data.isActive === 'boolean') { fields.push('is_active = ?'); values.push(data.isActive ? 1 : 0); }
    if (data.password) { fields.push('password = ?'); values.push(bcrypt.hashSync(data.password, 12)); }

    if (!fields.length) {
      return this.findById(id);
    }

    fields.push('updated_at = CURRENT_TIMESTAMP');
    values.push(id);

    db.run(`UPDATE employees SET ${fields.join(', ')} WHERE id = ?`, values);
    saveDatabase();
    
    return this.findById(id);
  }

  static resetPassword(id) {
    const db = getDatabase();
    const newPassword = this.generatePassword();
    const hashedPassword = bcrypt.hashSync(newPassword, 12);

    db.run(
      'UPDATE employees SET password = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [hashedPassword, id]
    );
    saveDatabase();

    return { password: newPassword, employee: this.findById(id) };
  }

  static delete(id) {
    const db = getDatabase();
    db.run('DELETE FROM attendance WHERE employee_id = ?', [id]);
    db.run('DELETE FROM employees WHERE id = ?', [id]);
    saveDatabase();
    return true;
  }

  static count(filters = {}) {
    const db = getDatabase();
    let query = 'SELECT COUNT(*) as count FROM employees WHERE is_active = 1';
    const params = [];

    if (filters.department) {
      query += ' AND department = ?';
      params.push(filters.department);
    }

    const result = db.exec(query, params);
    return result[0].values[0][0];
  }

  static comparePassword(password, hash) {
    return bcrypt.compareSync(password, hash);
  }
}

export default Employee;
