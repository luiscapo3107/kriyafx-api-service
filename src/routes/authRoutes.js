// routes/authRoutes.js
const express = require('express');
const { register, login, deleteUser } = require('../controllers/authController');
const { check } = require('express-validator');
const authenticateAdmin = require('../middleware/adminMiddleware');

const router = express.Router();

router.post(
    '/register',
    authenticateAdmin, // Add this middleware
    [
      check('username', 'Username is required').notEmpty(),
      check('username', 'Username must be 3+ characters').isLength({ min: 3 }),
      check('password', 'Password is required').notEmpty(),
      check('password', 'Password must be 6+ characters').isLength({ min: 6 }),
    ],
    register
  );
  
  router.post(
    '/login',
    [
      check('username', 'Username is required').notEmpty(),
      check('password', 'Password is required').notEmpty(),
    ],
    login
);

router.delete('/users/:username', authenticateAdmin, deleteUser);

module.exports = router;
