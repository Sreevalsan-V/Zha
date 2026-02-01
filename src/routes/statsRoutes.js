const express = require('express');
const router = express.Router();
const { validateStats } = require('../middleware/validators');
const { getStatistics } = require('../controllers/statsController');

// GET /api/stats - Get statistics
router.get('/stats', validateStats, getStatistics);

module.exports = router;
