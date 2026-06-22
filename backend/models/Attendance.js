import { getDatabase, saveDatabase } from '../database/init.js';

class Attendance {
  static create(data) {
    const db = getDatabase();
    
    db.run(
      `INSERT INTO attendance (employee_id, date, check_in, status, confidence, marked_by)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        data.employeeId,
        data.date,
        data.checkIn || null,
        data.status,
        data.confidence || null,
        data.markedBy || 'System'
      ]
    );
    
    const result = db.exec('SELECT last_insert_rowid() as id');
    saveDatabase();
    
    return { id: result[0].values[0][0], ...data };
  }

  static findByEmployeeAndDate(employeeId, date) {
    const db = getDatabase();
    const result = db.exec(
      'SELECT * FROM attendance WHERE employee_id = ? AND date = ?',
      [employeeId, date]
    );
    
    if (!result.length || !result[0].values.length) return null;
    
    const columns = result[0].columns;
    const values = result[0].values[0];
    const record = {};
    
    columns.forEach((col, idx) => {
      record[col] = values[idx];
    });
    
    return {
      ...record,
      _id: record.id,
      employeeId: record.employee_id,
      checkIn: record.check_in,
      markedBy: record.marked_by
    };
  }

  static findByDate(date) {
    const db = getDatabase();
    const result = db.exec(
      `SELECT a.*, e.id as emp_id, e.employee_id, e.name, e.email, e.department, e.designation
       FROM attendance a
       JOIN employees e ON a.employee_id = e.id
       WHERE a.date = ?
       ORDER BY a.check_in DESC`,
      [date]
    );
    
    if (!result.length || !result[0].values.length) return [];
    
    const columns = result[0].columns;
    return result[0].values.map(values => {
      const record = {};
      columns.forEach((col, idx) => {
        record[col] = values[idx];
      });
      
      return {
        _id: record.id,
        employeeId: {
          _id: record.emp_id,
          employeeId: record.employee_id,
          name: record.name,
          email: record.email,
          department: record.department,
          designation: record.designation
        },
        date: record.date,
        checkIn: record.check_in,
        status: record.status,
        confidence: record.confidence,
        markedBy: record.marked_by
      };
    });
  }

  static findByEmployeeId(employeeId, filters = {}) {
    const db = getDatabase();
    let query = 'SELECT * FROM attendance WHERE employee_id = ?';
    const params = [employeeId];

    if (filters.startDate && filters.endDate) {
      query += ' AND date BETWEEN ? AND ?';
      params.push(filters.startDate, filters.endDate);
    }

    query += ' ORDER BY date DESC';

    const result = db.exec(query, params);
    
    if (!result.length || !result[0].values.length) return [];
    
    const columns = result[0].columns;
    return result[0].values.map(values => {
      const record = {};
      columns.forEach((col, idx) => {
        record[col] = values[idx];
      });
      
      return {
        ...record,
        _id: record.id,
        employeeId: record.employee_id,
        checkIn: record.check_in,
        markedBy: record.marked_by
      };
    });
  }

  static getDailyStats(startDate) {
    const db = getDatabase();
    const result = db.exec(
      `SELECT 
        date,
        SUM(CASE WHEN status = 'Present' THEN 1 ELSE 0 END) as present,
        SUM(CASE WHEN status = 'Late' THEN 1 ELSE 0 END) as late,
        SUM(CASE WHEN status = 'Absent' THEN 1 ELSE 0 END) as absent
       FROM attendance
       WHERE date >= ?
       GROUP BY date
       ORDER BY date ASC`,
      [startDate]
    );
    
    if (!result.length || !result[0].values.length) return [];
    
    const columns = result[0].columns;
    return result[0].values.map(values => {
      const row = {};
      columns.forEach((col, idx) => {
        row[col] = values[idx];
      });
      return { _id: row.date, ...row };
    });
  }

  static getMonthlyStats(startDate) {
    const db = getDatabase();
    const result = db.exec(
      `SELECT 
        strftime('%Y-%m', date) as month,
        SUM(CASE WHEN status = 'Present' THEN 1 ELSE 0 END) as present,
        SUM(CASE WHEN status = 'Late' THEN 1 ELSE 0 END) as late,
        SUM(CASE WHEN status = 'Absent' THEN 1 ELSE 0 END) as absent
       FROM attendance
       WHERE date >= ?
       GROUP BY strftime('%Y-%m', date)
       ORDER BY month ASC`,
      [startDate]
    );
    
    if (!result.length || !result[0].values.length) return [];
    
    const columns = result[0].columns;
    return result[0].values.map(values => {
      const row = {};
      columns.forEach((col, idx) => {
        row[col] = values[idx];
      });
      return { _id: row.month, ...row };
    });
  }

  static insertMany(records) {
    const db = getDatabase();
    
    for (const record of records) {
      try {
        db.run(
          `INSERT OR IGNORE INTO attendance (employee_id, date, status, marked_by)
           VALUES (?, ?, ?, ?)`,
          [record.employeeId, record.date, record.status, record.markedBy]
        );
      } catch (error) {
        console.error('Error inserting attendance record:', error);
      }
    }
    
    saveDatabase();
  }

  static getReportData(filters) {
    const db = getDatabase();
    let query = `
      SELECT a.*, e.employee_id, e.name, e.email, e.department, e.designation
      FROM attendance a
      JOIN employees e ON a.employee_id = e.id
      WHERE a.date BETWEEN ? AND ?
    `;
    const params = [filters.startDate, filters.endDate];

    if (filters.department) {
      query += ' AND e.department = ?';
      params.push(filters.department);
    }

    query += ' ORDER BY a.date DESC';

    const result = db.exec(query, params);
    
    if (!result.length || !result[0].values.length) return [];
    
    const columns = result[0].columns;
    return result[0].values.map(values => {
      const record = {};
      columns.forEach((col, idx) => {
        record[col] = values[idx];
      });
      
      return {
        _id: record.id,
        employeeId: {
          employeeId: record.employee_id,
          name: record.name,
          email: record.email,
          department: record.department,
          designation: record.designation
        },
        date: record.date,
        checkIn: record.check_in,
        status: record.status,
        confidence: record.confidence
      };
    });
  }
}

export default Attendance;
