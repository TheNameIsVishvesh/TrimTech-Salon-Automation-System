const express = require('express');
const {
  getAll,
  getById,
  create,
  update,
  remove
} = require('../controllers/serviceController');
const { protect, ownerOnly } = require('../middleware/auth');

const router = express.Router();

// Public: list and get one
router.get('/', getAll);
router.get('/:id', getById);

// Owner only: create, update, delete
router.post('/', protect, ownerOnly, create);
router.patch('/:id', protect, ownerOnly, update);
router.delete('/:id', protect, ownerOnly, remove);

module.exports = router;
