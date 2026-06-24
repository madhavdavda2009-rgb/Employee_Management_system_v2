import jwt from 'jsonwebtoken';

export const authenticate = (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ error: 'No token provided' });
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    if (decoded.role === 'admin') {
      req.admin = decoded;
    } else if (decoded.role === 'employee') {
      req.employee = decoded;
    }
    next();
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' });
  }
};

export const authorize = (...roles) => (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ error: 'No token provided' });
  }

  if (!roles.includes(req.user.role)) {
    return res.status(403).json({ error: 'Access denied' });
  }

  next();
};
