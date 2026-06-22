import Employee from '../models/Employee.js';
import Attendance from '../models/Attendance.js';

export function markAbsentEmployees() {
  try {
    const today = new Date().toISOString().split('T')[0];

    const employees = Employee.findAll();
    const markedAttendance = Attendance.findByDate(today);
    
    const markedEmployeeIds = new Set(
      markedAttendance.map(a => a.employeeId._id)
    );

    const absentEmployees = employees.filter(
      emp => !markedEmployeeIds.has(emp._id)
    );

    const absentRecords = absentEmployees.map(emp => ({
      employeeId: emp._id,
      date: today,
      status: 'Absent',
      markedBy: 'System'
    }));

    if (absentRecords.length > 0) {
      Attendance.insertMany(absentRecords);
      console.log(`Marked ${absentRecords.length} employees as absent`);
    }
  } catch (error) {
    console.error('Error marking absent employees:', error);
  }
}
