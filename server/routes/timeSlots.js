const express = require('express');
const {
  getAll,
  create,
  update,
  remove
} = require('../controllers/timeSlotController');
const { protect, ownerOnly } = require('../middleware/auth');

const router = express.Router();

router.get('/', getAll);

router.post('/', protect, ownerOnly, create);
router.patch('/:id', protect, ownerOnly, update);
router.delete('/:id', protect, ownerOnly, remove);

module.exports = router;
