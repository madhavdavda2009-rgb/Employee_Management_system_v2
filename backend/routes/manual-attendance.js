import express from 'express';
import Employee from '../models/Employee.js';
import Attendance from '../models/Attendance.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = express.Router();

router.use(authenticate);
router.use(authorize('admin'));

router.post('/mark-manual', async (req, res) => {
  try {
    const { employeeId, status } = req.body;
    
    if (!employeeId || !status) {
      return res.status(400).json({ error: 'Employee ID and status are required' });
    }

    const employee = Employee.findById(employeeId);
    if (!employee) {
      return res.status(404).json({ error: 'Employee not found' });
    }

    const today = new Date().toISOString().split('T')[0];
    const existingAttendance = Attendance.findByEmployeeAndDate(employeeId, today);

    if (existingAttendance) {
      return res.status(400).json({ error: 'Attendance already recorded today' });
    }

    const now = new Date();
    const attendance = Attendance.create({
      employeeId,
      date: today,
      checkIn: now.toISOString(),
      status,
      markedBy: 'Admin'
    });

    const { faceEncoding, ...employeeData } = employee;

    res.json({
      message: 'Attendance marked successfully',
      attendance,
      employee: employeeData,
      status
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
