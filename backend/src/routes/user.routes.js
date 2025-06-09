const express = require('express');
const { body } = require('express-validator');
const { auth } = require('../middlewares/auth.middleware');
const {
  register,
  login,
  getProfile,
  updateProfile,
  changePassword,
} = require('../controllers/user.controller');

const router = express.Router();

// Validation middleware
const registerValidation = [
  body('email').isEmail().withMessage('Please enter a valid email'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long'),
  body('name').notEmpty().withMessage('Name is required'),
  body('phone').optional().isMobilePhone().withMessage('Invalid phone number'),
];

const loginValidation = [
  body('email').isEmail().withMessage('Please enter a valid email'),
  body('password').notEmpty().withMessage('Password is required'),
];

const updateProfileValidation = [
  body('name').optional().notEmpty().withMessage('Name cannot be empty'),
  body('phone').optional().isMobilePhone().withMessage('Invalid phone number'),
];

const changePasswordValidation = [
  body('currentPassword').notEmpty().withMessage('Current password is required'),
  body('newPassword')
    .isLength({ min: 6 })
    .withMessage('New password must be at least 6 characters long'),
];

// Routes
router.post('/register', registerValidation, register);
router.post('/login', loginValidation, login);
router.get('/profile', auth, getProfile);
router.put('/profile', auth, updateProfileValidation, updateProfile);
router.put('/change-password', auth, changePasswordValidation, changePassword);

module.exports = router; 