const express = require('express');
const {
  getAll,
  getById,
  create,
  update,
  remove
} = require('../controllers/productController');
const { protect, ownerOnly } = require('../middleware/auth');

const router = express.Router();

router.get('/', getAll);
router.get('/:id', getById);

router.post('/', protect, ownerOnly, create);
router.patch('/:id', protect, ownerOnly, update);
router.delete('/:id', protect, ownerOnly, remove);

module.exports = router;
