const express = require('express');
const { body } = require('express-validator');
const { auth, authorize } = require('../middlewares/auth.middleware');
const {
  createBooking,
  getBookings,
  getBookingById,
  updateBookingStatus,
  cancelBooking,
} = require('../controllers/booking.controller');

const router = express.Router();

// Validation middleware
const bookingValidation = [
  body('courtId').notEmpty().withMessage('Court ID is required'),
  body('startTime')
    .isISO8601()
    .withMessage('Start time must be a valid date')
    .custom((value) => {
      if (new Date(value) < new Date()) {
        throw new Error('Start time must be in the future');
      }
      return true;
    }),
  body('endTime')
    .isISO8601()
    .withMessage('End time must be a valid date')
    .custom((value, { req }) => {
      if (new Date(value) <= new Date(req.body.startTime)) {
        throw new Error('End time must be after start time');
      }
      return true;
    }),
  body('notes').optional().isString().withMessage('Notes must be a string'),
];

const statusValidation = [
  body('status')
    .isIn(['pending', 'confirmed', 'cancelled', 'completed'])
    .withMessage('Invalid status'),
];

// Routes
router.post('/', auth, bookingValidation, createBooking);
router.get('/', auth, getBookings);
router.get('/:id', auth, getBookingById);
router.put('/:id/status', auth, statusValidation, updateBookingStatus);
router.put('/:id/cancel', auth, cancelBooking);

module.exports = router; 