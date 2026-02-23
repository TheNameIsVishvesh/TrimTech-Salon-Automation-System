const express = require('express');
const {
  getAll,
  getById,
  createEmployee,
  update,
  remove
} = require('../controllers/userController');
const { protect, ownerOnly } = require('../middleware/auth');

const router = express.Router();

router.use(protect);

router.get('/', getAll);
router.get('/:id', getById);

router.post('/employees', ownerOnly, createEmployee);
router.patch('/:id', ownerOnly, update);
router.delete('/:id', ownerOnly, remove);

module.exports = router;
