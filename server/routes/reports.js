const express = require('express');
const {
  dashboard,
  serviceDemand,
  peakHours,
  timePrediction
} = require('../controllers/reportController');
const { protect, ownerOnly } = require('../middleware/auth');

const router = express.Router();

router.use(protect);
router.use(ownerOnly);

router.get('/dashboard', dashboard);
router.get('/service-demand', serviceDemand);
router.get('/peak-hours', peakHours);
router.get('/time-prediction', timePrediction);

module.exports = router;
