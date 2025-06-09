const Court = require('../models/court.model');
const logger = require('../config/logger');
const { redisClient } = require('../config/redis');

const createCourt = async (req, res) => {
  try {
    const court = await Court.create({
      ...req.body,
      owner: req.user._id,
    });

    res.status(201).json({
      message: 'Court created successfully',
      court,
    });
  } catch (error) {
    logger.error('Create court error:', error);
    res.status(500).json({ message: 'Error creating court' });
  }
};

const getCourts = async (req, res) => {
  try {
    const {
      sportType,
      minPrice,
      maxPrice,
      rating,
      page = 1,
      limit = 10,
      sort = '-createdAt',
    } = req.query;

    const query = { isActive: true };
    if (sportType) query.sportType = sportType;
    if (minPrice || maxPrice) {
      query.pricePerHour = {};
      if (minPrice) query.pricePerHour.$gte = minPrice;
      if (maxPrice) query.pricePerHour.$lte = maxPrice;
    }
    if (rating) query['rating.average'] = { $gte: rating };

    const skip = (page - 1) * limit;

    const courts = await Court.find(query)
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit))
      .populate('owner', 'name email');

    const total = await Court.countDocuments(query);

    res.json({
      courts,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalCourts: total,
    });
  } catch (error) {
    logger.error('Get courts error:', error);
    res.status(500).json({ message: 'Error fetching courts' });
  }
};

const getCourtById = async (req, res) => {
  try {
    const court = await Court.findById(req.params.id)
      .populate('owner', 'name email')
      .populate({
        path: 'reviews',
        populate: {
          path: 'user',
          select: 'name',
        },
      });

    if (!court) {
      return res.status(404).json({ message: 'Court not found' });
    }

    // Cache court data
    await redisClient.set(
      `court:${req.params.id}`,
      JSON.stringify(court),
      'EX',
      3600
    );

    res.json(court);
  } catch (error) {
    logger.error('Get court by id error:', error);
    res.status(500).json({ message: 'Error fetching court' });
  }
};

const updateCourt = async (req, res) => {
  try {
    const court = await Court.findOne({
      _id: req.params.id,
      owner: req.user._id,
    });

    if (!court) {
      return res.status(404).json({ message: 'Court not found' });
    }

    Object.assign(court, req.body);
    await court.save();

    // Update cache
    await redisClient.del(`court:${req.params.id}`);

    res.json({
      message: 'Court updated successfully',
      court,
    });
  } catch (error) {
    logger.error('Update court error:', error);
    res.status(500).json({ message: 'Error updating court' });
  }
};

const deleteCourt = async (req, res) => {
  try {
    const court = await Court.findOne({
      _id: req.params.id,
      owner: req.user._id,
    });

    if (!court) {
      return res.status(404).json({ message: 'Court not found' });
    }

    court.isActive = false;
    await court.save();

    // Remove from cache
    await redisClient.del(`court:${req.params.id}`);

    res.json({ message: 'Court deleted successfully' });
  } catch (error) {
    logger.error('Delete court error:', error);
    res.status(500).json({ message: 'Error deleting court' });
  }
};

const searchCourts = async (req, res) => {
  try {
    const { location, radius = 5000 } = req.query;

    if (!location) {
      return res.status(400).json({ message: 'Location is required' });
    }

    const [lng, lat] = location.split(',').map(Number);

    const courts = await Court.find({
      isActive: true,
      'address.coordinates': {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [lng, lat],
          },
          $maxDistance: radius,
        },
      },
    }).populate('owner', 'name email');

    res.json(courts);
  } catch (error) {
    logger.error('Search courts error:', error);
    res.status(500).json({ message: 'Error searching courts' });
  }
};

module.exports = {
  createCourt,
  getCourts,
  getCourtById,
  updateCourt,
  deleteCourt,
  searchCourts,
}; 