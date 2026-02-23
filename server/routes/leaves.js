const express = require('express');
const { getAll, create, updateStatus } = require('../controllers/leaveController');
const { protect, ownerOnly } = require('../middleware/auth');

const router = express.Router();

router.use(protect);

router.get('/', getAll);
router.post('/', create);
router.patch('/:id/status', ownerOnly, updateStatus);

module.exports = router;
