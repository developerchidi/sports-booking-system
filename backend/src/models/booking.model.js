const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema(
  {
    court: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Court',
      required: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    startTime: {
      type: Date,
      required: true,
    },
    endTime: {
      type: Date,
      required: true,
    },
    totalPrice: {
      type: Number,
      required: true,
      min: 0,
    },
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'cancelled', 'completed'],
      default: 'pending',
    },
    paymentStatus: {
      type: String,
      enum: ['pending', 'paid', 'refunded'],
      default: 'pending',
    },
    paymentMethod: {
      type: String,
      enum: ['credit_card', 'debit_card', 'bank_transfer'],
    },
    paymentId: {
      type: String,
    },
    notes: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

// Validate that endTime is after startTime
bookingSchema.pre('save', function (next) {
  if (this.endTime <= this.startTime) {
    next(new Error('End time must be after start time'));
  }
  next();
});

// Calculate total price before saving
bookingSchema.pre('save', async function (next) {
  if (this.isModified('startTime') || this.isModified('endTime')) {
    const Court = mongoose.model('Court');
    const court = await Court.findById(this.court);
    const hours = (this.endTime - this.startTime) / (1000 * 60 * 60);
    this.totalPrice = court.pricePerHour * hours;
  }
  next();
});

const Booking = mongoose.model('Booking', bookingSchema);

module.exports = Booking; 