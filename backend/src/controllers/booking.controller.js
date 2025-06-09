const Booking = require('../models/booking.model');
const Court = require('../models/court.model');
const logger = require('../config/logger');
const { redisClient } = require('../config/redis');

const createBooking = async (req, res) => {
  try {
    const { courtId, startTime, endTime, notes } = req.body;

    // Check if court exists and is active
    const court = await Court.findOne({ _id: courtId, isActive: true });
    if (!court) {
      return res.status(404).json({ message: 'Court not found' });
    }

    // Check if time slot is available
    const existingBooking = await Booking.findOne({
      court: courtId,
      status: { $in: ['pending', 'confirmed'] },
      $or: [
        {
          startTime: { $lt: endTime },
          endTime: { $gt: startTime },
        },
      ],
    });

    if (existingBooking) {
      return res.status(400).json({
        message: 'Time slot is already booked',
      });
    }

    const booking = await Booking.create({
      court: courtId,
      user: req.user._id,
      startTime,
      endTime,
      notes,
      totalPrice: court.pricePerHour * ((endTime - startTime) / (1000 * 60 * 60)),
    });

    res.status(201).json({
      message: 'Booking created successfully',
      booking,
    });
  } catch (error) {
    logger.error('Create booking error:', error);
    res.status(500).json({ message: 'Error creating booking' });
  }
};

const getBookings = async (req, res) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;

    const query = { user: req.user._id };
    if (status) query.status = status;

    const skip = (page - 1) * limit;

    const bookings = await Booking.find(query)
      .sort('-createdAt')
      .skip(skip)
      .limit(parseInt(limit))
      .populate('court', 'name sportType pricePerHour')
      .populate('user', 'name email');

    const total = await Booking.countDocuments(query);

    res.json({
      bookings,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalBookings: total,
    });
  } catch (error) {
    logger.error('Get bookings error:', error);
    res.status(500).json({ message: 'Error fetching bookings' });
  }
};

const getBookingById = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate('court', 'name sportType pricePerHour')
      .populate('user', 'name email');

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    // Check if user is authorized to view this booking
    if (
      booking.user._id.toString() !== req.user._id.toString() &&
      req.user.role !== 'admin'
    ) {
      return res.status(403).json({
        message: 'You do not have permission to view this booking',
      });
    }

    res.json(booking);
  } catch (error) {
    logger.error('Get booking by id error:', error);
    res.status(500).json({ message: 'Error fetching booking' });
  }
};

const updateBookingStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    // Check if user is authorized to update this booking
    if (
      booking.user.toString() !== req.user._id.toString() &&
      req.user.role !== 'admin'
    ) {
      return res.status(403).json({
        message: 'You do not have permission to update this booking',
      });
    }

    booking.status = status;
    await booking.save();

    res.json({
      message: 'Booking status updated successfully',
      booking,
    });
  } catch (error) {
    logger.error('Update booking status error:', error);
    res.status(500).json({ message: 'Error updating booking status' });
  }
};

const cancelBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    // Check if user is authorized to cancel this booking
    if (
      booking.user.toString() !== req.user._id.toString() &&
      req.user.role !== 'admin'
    ) {
      return res.status(403).json({
        message: 'You do not have permission to cancel this booking',
      });
    }

    // Check if booking can be cancelled
    if (booking.status !== 'pending' && booking.status !== 'confirmed') {
      return res.status(400).json({
        message: 'Only pending or confirmed bookings can be cancelled',
      });
    }

    booking.status = 'cancelled';
    await booking.save();

    res.json({
      message: 'Booking cancelled successfully',
      booking,
    });
  } catch (error) {
    logger.error('Cancel booking error:', error);
    res.status(500).json({ message: 'Error cancelling booking' });
  }
};

module.exports = {
  createBooking,
  getBookings,
  getBookingById,
  updateBookingStatus,
  cancelBooking,
}; 