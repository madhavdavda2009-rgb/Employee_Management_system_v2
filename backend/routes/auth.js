import express from 'express';
import jwt from 'jsonwebtoken';
import { body, validationResult } from 'express-validator';
import Admin from '../models/Admin.js';
import Employee from '../models/Employee.js';

const router = express.Router();

router.post('/login', [
  body('email').isEmail(),
  body('password').notEmpty()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;
    const admin = Admin.findByEmail(email);
    if (admin && Admin.comparePassword(password, admin.password)) {
      const token = jwt.sign(
        { id: admin.id, email: admin.email, role: 'admin' },
        process.env.JWT_SECRET,
        { expiresIn: '24h' }
      );

      const user = { id: admin.id, name: admin.name, email: admin.email, role: 'admin' };
      return res.json({ token, user, admin: user });
    }

    const employee = Employee.findByEmail(email);
    if (!employee || !employee.isActive) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    if (!Employee.comparePassword(password, employee.password)) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { id: employee.id, email: employee.email, role: 'employee' },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    const user = {
      id: employee.id,
      employeeId: employee.employeeId,
      name: employee.name,
      email: employee.email,
      role: 'employee'
    };

    res.json({ token, user, employee: user });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/register', [
  body('email').isEmail(),
  body('password').isLength({ min: 6 }),
  body('name').notEmpty()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    if (Admin.count() > 0) {
      return res.status(403).json({ error: 'Registration is disabled. Please use existing admin credentials.' });
    }

    const { email, password, name } = req.body;
    const existingAdmin = Admin.findByEmail(email);
    
    if (existingAdmin) {
      return res.status(400).json({ error: 'Admin already exists' });
    }

    Admin.create({ email, password, name });
    res.status(201).json({ message: 'Admin created successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
