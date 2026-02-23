const express = require('express');
const {
  getAll,
  getById,
  create,
  update,
  getAvailableSlots
} = require('../controllers/appointmentController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.use(protect);

router.get('/', getAll);
router.get('/available-slots', getAvailableSlots);
router.get('/:id', getById);
router.post('/', create);
router.patch('/:id', update);

module.exports = router;
