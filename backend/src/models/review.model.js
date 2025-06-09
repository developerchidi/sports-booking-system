const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema(
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
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    comment: {
      type: String,
      required: true,
      trim: true,
    },
    images: [{
      type: String,
    }],
    isVerified: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Update court rating when a review is created or updated
reviewSchema.post('save', async function () {
  const Court = mongoose.model('Court');
  const Review = mongoose.model('Review');

  const reviews = await Review.find({ court: this.court });
  const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
  const averageRating = totalRating / reviews.length;

  await Court.findByIdAndUpdate(this.court, {
    'rating.average': averageRating,
    'rating.count': reviews.length,
  });
});

// Update court rating when a review is deleted
reviewSchema.post('remove', async function () {
  const Court = mongoose.model('Court');
  const Review = mongoose.model('Review');

  const reviews = await Review.find({ court: this.court });
  const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
  const averageRating = reviews.length > 0 ? totalRating / reviews.length : 0;

  await Court.findByIdAndUpdate(this.court, {
    'rating.average': averageRating,
    'rating.count': reviews.length,
  });
});

const Review = mongoose.model('Review', reviewSchema);

module.exports = Review; 