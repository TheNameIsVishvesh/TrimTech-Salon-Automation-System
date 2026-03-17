const express = require('express');
const router = express.Router();

const { protect, ownerOnly } = require('../middleware/auth');
const analyticsController = require('../controllers/analyticsController');

router.get('/revenue', protect, ownerOnly, analyticsController.getRevenueAnalytics);
router.get('/employee-performance', protect, ownerOnly, analyticsController.getEmployeePerformance);
router.get('/no-shows', protect, ownerOnly, analyticsController.getNoShowAnalytics);
router.get('/dashboard-summary', protect, ownerOnly, analyticsController.getDashboardSummary);

module.exports = router;
