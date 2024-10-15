// routes/dataRoutes.js
const express = require('express');
const { getOptionsChain } = require('../controllers/dataController');
const authenticateToken = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/options-chain', authenticateToken, getOptionsChain);

module.exports = router;
