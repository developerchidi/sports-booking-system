const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const { connectRedis } = require('./redis');
const { errorHandler, notFound } = require('../middlewares/error.middleware');
const userRoutes = require('../routes/user.routes');
const courtRoutes = require('../routes/court.routes');
const bookingRoutes = require('../routes/booking.routes');
const reviewRoutes = require('../routes/review.routes');

const app = express();

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// Routes
app.use('/api/users', userRoutes);
app.use('/api/courts', courtRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/reviews', reviewRoutes);

// Error handling
app.use(notFound);
app.use(errorHandler);

// Connect to Redis
connectRedis();

module.exports = app; 