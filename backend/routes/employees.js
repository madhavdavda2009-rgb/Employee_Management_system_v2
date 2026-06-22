import express from 'express';
import { body, validationResult } from 'express-validator';
import Employee from '../models/Employee.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

router.use(authenticate);

router.post('/', [
  body('employeeId').notEmpty(),
  body('name').notEmpty(),
  body('email').isEmail(),
  body('phone').notEmpty(),
  body('department').notEmpty(),
  body('designation').notEmpty(),
  body('joiningDate').isISO8601(),
  body('salary').isNumeric(),
  body('faceDescriptor').isArray()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { faceDescriptor, ...employeeData } = req.body;

    if (!faceDescriptor || faceDescriptor.length === 0) {
      return res.status(400).json({ error: 'Face registration failed. Please try again.' });
    }

    const employee = Employee.create({
      ...employeeData,
      faceEncoding: faceDescriptor
    });

    res.status(201).json({ message: 'Employee created successfully', employee });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ error: 'Employee ID or email already exists' });
    }
    res.status(500).json({ error: error.message });
  }
});

router.get('/', async (req, res) => {
  try {
    const { department, search } = req.query;
    const employees = Employee.findAll({ department, search });
    
    const result = employees.map(emp => {
      const { faceEncoding, ...rest } = emp;
      return rest;
    });
    
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const employee = Employee.findById(req.params.id);
    if (!employee) return res.status(404).json({ error: 'Employee not found' });
    
    const { faceEncoding, ...result } = employee;
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const { faceEncoding, ...updateData } = req.body;
    const employee = Employee.update(req.params.id, updateData);
    
    if (!employee) return res.status(404).json({ error: 'Employee not found' });
    
    const { faceEncoding: _, ...result } = employee;
    res.json({ message: 'Employee updated successfully', employee: result });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const success = Employee.delete(req.params.id);
    if (!success) return res.status(404).json({ error: 'Employee not found' });
    res.json({ message: 'Employee deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
