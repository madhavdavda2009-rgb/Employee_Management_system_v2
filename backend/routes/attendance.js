import express from 'express';
import Employee from '../models/Employee.js';
import Attendance from '../models/Attendance.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = express.Router();

router.use(authenticate);

router.post('/mark', async (req, res) => {
  try {
    const { faceDescriptor } = req.body;
    
    if (!faceDescriptor || faceDescriptor.length === 0) {
      return res.status(400).json({ error: 'No face descriptor provided' });
    }

    let bestMatch = null;
    let minDistance = Infinity;
    const threshold = 0.6;

    if (req.user.role === 'employee') {
      const currentEmployee = Employee.findById(req.user.id);
      if (!currentEmployee) {
        return res.status(404).json({ error: 'Employee not found' });
      }

      const distance = euclideanDistance(faceDescriptor, currentEmployee.faceEncoding);
      if (distance >= threshold) {
        return res.status(400).json({ error: 'Face does not match this account.' });
      }

      bestMatch = currentEmployee;
      minDistance = distance;
    } else {
      const employees = Employee.findAll();

      if (employees.length === 0) {
        return res.status(404).json({ error: 'No employees registered' });
      }

      for (const emp of employees) {
        const distance = euclideanDistance(faceDescriptor, emp.faceEncoding);
        if (distance < minDistance && distance < threshold) {
          minDistance = distance;
          bestMatch = emp;
        }
      }

      if (!bestMatch) {
        return res.status(404).json({ error: 'Face not recognized' });
      }
    }

    const today = new Date().toISOString().split('T')[0];
    const existingAttendance = Attendance.findByEmployeeAndDate(bestMatch._id, today);

    if (existingAttendance) {
      return res.status(400).json({ error: 'Attendance already recorded today' });
    }

    const now = new Date();
    const [officeHour, officeMinute] = process.env.OFFICE_START_TIME.split(':').map(Number);
    const officeTime = new Date(now);
    officeTime.setHours(officeHour, officeMinute, 0, 0);

    const status = now > officeTime ? 'Late' : 'Present';
    const confidence = ((1 - minDistance) * 100).toFixed(2);

    const attendance = Attendance.create({
      employeeId: bestMatch._id,
      date: today,
      checkIn: now.toISOString(),
      status,
      confidence,
      markedBy: 'System'
    });

    const { faceEncoding, ...employeeData } = bestMatch;

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

function euclideanDistance(desc1, desc2) {
  if (desc1.length !== desc2.length) return Infinity;
  
  let sum = 0;
  for (let i = 0; i < desc1.length; i++) {
    sum += Math.pow(desc1[i] - desc2[i], 2);
  }
  return Math.sqrt(sum);
}

router.get('/today', authorize('admin'), async (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0];
    const attendance = Attendance.findByDate(today);
    res.json(attendance);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/me', async (req, res) => {
  try {
    if (req.user.role !== 'employee') {
      return res.status(403).json({ error: 'Access denied' });
    }

    const { startDate, endDate } = req.query;
    const attendance = Attendance.findByEmployeeId(req.user.id, { startDate, endDate });
    res.json(attendance);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/employee/:employeeId', authorize('admin'), async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const attendance = Attendance.findByEmployeeId(req.params.employeeId, { startDate, endDate });
    res.json(attendance);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/stats', authorize('admin'), async (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0];
    
    const totalEmployees = Employee.count();
    const todayAttendance = Attendance.findByDate(today);

    const present = todayAttendance.filter(a => a.status === 'Present').length;
    const late = todayAttendance.filter(a => a.status === 'Late').length;
    const absent = totalEmployees - todayAttendance.length;

    res.json({
      totalEmployees,
      present,
      late,
      absent,
      percentage: totalEmployees > 0 ? ((present + late) / totalEmployees * 100).toFixed(2) : 0
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
