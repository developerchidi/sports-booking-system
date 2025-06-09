const Review = require('../models/review.model');
const Court = require('../models/court.model');
const Booking = require('../models/booking.model');
const logger = require('../config/logger');
const { redisClient } = require('../config/redis');

const createReview = async (req, res) => {
  try {
    const { courtId, rating, comment, images } = req.body;

    // Check if court exists and is active
    const court = await Court.findOne({ _id: courtId, isActive: true });
    if (!court) {
      return res.status(404).json({ message: 'Court not found' });
    }

    // Check if user has completed a booking for this court
    const booking = await Booking.findOne({
      court: courtId,
      user: req.user._id,
      status: 'completed',
    });

    if (!booking) {
      return res.status(403).json({
        message: 'You can only review courts you have booked and completed',
      });
    }

    // Check if user has already reviewed this court
    const existingReview = await Review.findOne({
      court: courtId,
      user: req.user._id,
    });

    if (existingReview) {
      return res.status(400).json({
        message: 'You have already reviewed this court',
      });
    }

    const review = await Review.create({
      court: courtId,
      user: req.user._id,
      rating,
      comment,
      images,
    });

    // Clear court cache
    await redisClient.del(`court:${courtId}`);

    res.status(201).json({
      message: 'Review created successfully',
      review,
    });
  } catch (error) {
    logger.error('Create review error:', error);
    res.status(500).json({ message: 'Error creating review' });
  }
};

const getReviews = async (req, res) => {
  try {
    const { courtId, page = 1, limit = 10 } = req.query;

    const query = {};
    if (courtId) query.court = courtId;

    const skip = (page - 1) * limit;

    const reviews = await Review.find(query)
      .sort('-createdAt')
      .skip(skip)
      .limit(parseInt(limit))
      .populate('user', 'name')
      .populate('court', 'name sportType');

    const total = await Review.countDocuments(query);

    res.json({
      reviews,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalReviews: total,
    });
  } catch (error) {
    logger.error('Get reviews error:', error);
    res.status(500).json({ message: 'Error fetching reviews' });
  }
};

const getReviewById = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id)
      .populate('user', 'name')
      .populate('court', 'name sportType');

    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }

    res.json(review);
  } catch (error) {
    logger.error('Get review by id error:', error);
    res.status(500).json({ message: 'Error fetching review' });
  }
};

const updateReview = async (req, res) => {
  try {
    const { rating, comment, images } = req.body;
    const review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }

    // Check if user is authorized to update this review
    if (review.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        message: 'You do not have permission to update this review',
      });
    }

    if (rating) review.rating = rating;
    if (comment) review.comment = comment;
    if (images) review.images = images;

    await review.save();

    // Clear court cache
    await redisClient.del(`court:${review.court}`);

    res.json({
      message: 'Review updated successfully',
      review,
    });
  } catch (error) {
    logger.error('Update review error:', error);
    res.status(500).json({ message: 'Error updating review' });
  }
};

const deleteReview = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }

    // Check if user is authorized to delete this review
    if (
      review.user.toString() !== req.user._id.toString() &&
      req.user.role !== 'admin'
    ) {
      return res.status(403).json({
        message: 'You do not have permission to delete this review',
      });
    }

    await review.remove();

    // Clear court cache
    await redisClient.del(`court:${review.court}`);

    res.json({ message: 'Review deleted successfully' });
  } catch (error) {
    logger.error('Delete review error:', error);
    res.status(500).json({ message: 'Error deleting review' });
  }
};

module.exports = {
  createReview,
  getReviews,
  getReviewById,
  updateReview,
  deleteReview,
}; 