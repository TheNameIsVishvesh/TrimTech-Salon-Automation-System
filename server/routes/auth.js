const express = require('express');
const { body } = require('express-validator');
const { register, login, getMe, updateMe } = require('../controllers/authController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.post('/register', [
  body('name').trim().notEmpty(),
  body('email').isEmail(),
  body('password').isLength({ min: 6 }),
  body('role').isIn(['client', 'employee', 'owner'])
], register);

router.post('/login', [
  body('email').isEmail(),
  body('password').notEmpty()
], login);

router.get('/me', protect, getMe);
router.patch('/me', protect, updateMe);

module.exports = router;
