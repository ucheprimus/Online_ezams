const jwt = require('jsonwebtoken');

const verifyToken = (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    console.log('Verifying token...');
    
    if (!token) {
      console.log('No token provided');
      return res.status(401).json({ error: 'No authentication token, access denied' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'dev_secret');
    console.log('Token decoded:', decoded);
    
    // Use userId from token (matching what we set in auth.js)
    req.user = { id: decoded.userId, role: decoded.role };
    next();
  } catch (error) {
    console.error('Token verification error:', error.message);
    res.status(401).json({ error: 'Token is not valid' });
  }
};

module.exports = { verifyToken };