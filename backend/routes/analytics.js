import express from 'express';
import Attendance from '../models/Attendance.js';
import Employee from '../models/Employee.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

router.use(authenticate);

router.get('/daily', async (req, res) => {
  try {
    const { days = 7 } = req.query;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(days));
    const startDateStr = startDate.toISOString().split('T')[0];

    const attendance = Attendance.getDailyStats(startDateStr);
    res.json(attendance);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/department', async (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0];

    const employees = Employee.findAll();
    const todayAttendance = Attendance.findByDate(today);

    const attendanceMap = new Map();
    todayAttendance.forEach(a => {
      attendanceMap.set(a.employeeId._id, a.status);
    });

    const deptStats = {};
    employees.forEach(emp => {
      if (!deptStats[emp.department]) {
        deptStats[emp.department] = { total: 0, present: 0, late: 0, absent: 0 };
      }
      deptStats[emp.department].total++;
      
      const status = attendanceMap.get(emp._id);
      if (status === 'Present') deptStats[emp.department].present++;
      else if (status === 'Late') deptStats[emp.department].late++;
      else deptStats[emp.department].absent++;
    });

    res.json(deptStats);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/monthly', async (req, res) => {
  try {
    const { months = 6 } = req.query;
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - parseInt(months));
    const startDateStr = startDate.toISOString().split('T')[0];

    const attendance = Attendance.getMonthlyStats(startDateStr);
    res.json(attendance);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/employee-trends/:employeeId', async (req, res) => {
  try {
    const { days = 30 } = req.query;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(days));
    const startDateStr = startDate.toISOString().split('T')[0];
    
    const endDate = new Date().toISOString().split('T')[0];

    const attendance = Attendance.findByEmployeeId(req.params.employeeId, {
      startDate: startDateStr,
      endDate
    });

    res.json(attendance);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
