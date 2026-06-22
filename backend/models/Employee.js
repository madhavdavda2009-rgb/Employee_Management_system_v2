import { getDatabase, saveDatabase } from '../database/init.js';

class Employee {
  static create(data) {
    const db = getDatabase();
    
    db.run(
      `INSERT INTO employees (employee_id, name, email, phone, department, designation, joining_date, salary, face_encoding)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        data.employeeId,
        data.name,
        data.email,
        data.phone,
        data.department,
        data.designation,
        data.joiningDate,
        data.salary,
        JSON.stringify(data.faceEncoding)
      ]
    );
    
    const result = db.exec('SELECT last_insert_rowid() as id');
    saveDatabase();
    
    return { id: result[0].values[0][0], ...data };
  }

  static findAll(filters = {}) {
    const db = getDatabase();
    let query = 'SELECT * FROM employees WHERE is_active = 1';
    const params = [];

    if (filters.department) {
      query += ' AND department = ?';
      params.push(filters.department);
    }

    if (filters.search) {
      query += ' AND (name LIKE ? OR employee_id LIKE ? OR email LIKE ?)';
      const searchPattern = `%${filters.search}%`;
      params.push(searchPattern, searchPattern, searchPattern);
    }

    const result = db.exec(query, params);
    
    if (!result.length || !result[0].values.length) return [];
    
    const columns = result[0].columns;
    return result[0].values.map(values => {
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

    fields.push('updated_at = CURRENT_TIMESTAMP');
    values.push(id);

    db.run(`UPDATE employees SET ${fields.join(', ')} WHERE id = ?`, values);
    saveDatabase();
    
    return this.findById(id);
  }

  static delete(id) {
    const db = getDatabase();
    db.run('UPDATE employees SET is_active = 0 WHERE id = ?', [id]);
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
}

export default Employee;
