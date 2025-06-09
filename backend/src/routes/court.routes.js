const express = require('express');
const { body } = require('express-validator');
const { auth, authorize } = require('../middlewares/auth.middleware');
const {
  createCourt,
  getCourts,
  getCourtById,
  updateCourt,
  deleteCourt,
  searchCourts,
} = require('../controllers/court.controller');

const router = express.Router();

// Validation middleware
const courtValidation = [
  body('name').notEmpty().withMessage('Name is required'),
  body('description').notEmpty().withMessage('Description is required'),
  body('address.street').notEmpty().withMessage('Street is required'),
  body('address.city').notEmpty().withMessage('City is required'),
  body('address.state').notEmpty().withMessage('State is required'),
  body('address.zipCode').notEmpty().withMessage('Zip code is required'),
  body('address.coordinates.coordinates')
    .isArray()
    .withMessage('Coordinates must be an array')
    .custom((value) => {
      if (value.length !== 2) {
        throw new Error('Coordinates must contain longitude and latitude');
      }
      return true;
    }),
  body('sportType')
    .isIn(['basketball', 'tennis', 'badminton', 'volleyball', 'football'])
    .withMessage('Invalid sport type'),
  body('pricePerHour')
    .isFloat({ min: 0 })
    .withMessage('Price must be a positive number'),
  body('images').isArray().withMessage('Images must be an array'),
  body('openingHours').isObject().withMessage('Opening hours must be an object'),
];

// Routes
router.post('/', auth, authorize('owner'), courtValidation, createCourt);
router.get('/', getCourts);
router.get('/search', searchCourts);
router.get('/:id', getCourtById);
router.put('/:id', auth, authorize('owner'), courtValidation, updateCourt);
router.delete('/:id', auth, authorize('owner'), deleteCourt);

module.exports = router; 