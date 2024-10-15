// middleware/adminMiddleware.js
const config = require('../config/config');

const authenticateAdmin = (req, res, next) => {
  const adminToken = req.headers['x-admin-token'];

  if (!adminToken) {
    return res.status(401).json({ message: 'Admin token missing' });
  }

  if (adminToken !== config.adminToken) {
    return res.status(403).json({ message: 'Invalid admin token' });
  }

  next();
};

module.exports = authenticateAdmin;
