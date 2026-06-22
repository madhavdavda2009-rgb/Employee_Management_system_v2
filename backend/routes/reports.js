import express from 'express';
import Attendance from '../models/Attendance.js';
import Employee from '../models/Employee.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

router.use(authenticate);

router.get('/generate', async (req, res) => {
  try {
    const { startDate, endDate, department, format = 'json' } = req.query;

    if (!startDate || !endDate) {
      return res.status(400).json({ error: 'Start date and end date are required' });
    }

    const attendance = Attendance.getReportData({ startDate, endDate, department });

    const report = {
      period: { startDate, endDate },
      department: department || 'All',
      totalRecords: attendance.length,
      summary: {
        present: attendance.filter(a => a.status === 'Present').length,
        late: attendance.filter(a => a.status === 'Late').length,
        absent: attendance.filter(a => a.status === 'Absent').length
      },
      records: attendance
    };

    if (format === 'csv') {
      const csv = convertToCSV(attendance);
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename=attendance_report_${Date.now()}.csv`);
      return res.send(csv);
    }

    res.json(report);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

function convertToCSV(data) {
  const headers = ['Date', 'Employee ID', 'Name', 'Department', 'Check In', 'Status', 'Confidence'];
  const rows = data.map(record => [
    new Date(record.date).toLocaleDateString(),
    record.employeeId.employeeId,
    record.employeeId.name,
    record.employeeId.department,
    record.checkIn ? new Date(record.checkIn).toLocaleTimeString() : 'N/A',
    record.status,
    record.confidence ? record.confidence.toFixed(2) : 'N/A'
  ]);

  return [headers, ...rows].map(row => row.join(',')).join('\n');
}

export default router;
