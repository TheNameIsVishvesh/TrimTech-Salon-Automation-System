const express = require('express');
const { submit, getAll } = require('../controllers/contactController');
const { protect, ownerOnly } = require('../middleware/auth');

const router = express.Router();

router.post('/', submit);
router.get('/', protect, ownerOnly, getAll);

module.exports = router;
