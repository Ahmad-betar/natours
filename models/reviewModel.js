const mongoose = require('mongoose');
const Tour = require('./tourModel');

const reviewSchema = new mongoose.Schema(
  {
    review: {
      type: String,
      required: [true, 'Review must be provided'],
    },
    rating: {
      type: Number,
      min: 1,
      max: 5,
      required: [true, 'Rating must be provided'],
    },
    createdAt: {
      type: Date,
      default: Date.now(),
    },
    tour: {
      type: mongoose.Schema.ObjectId,
      ref: 'Tour',
      required: [true, 'Tour must be provided'],
    },
    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: [true, 'User must be provided'],
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

reviewSchema.statics.calcAverageRatings = async function (tourId) {
  const statics = await this.aggregate([
    { $match: { tour: tourId } },
    {
      $group: {
        _id: '$tour',
        count: { $sum: 1 },
        average: { $avg: '$rating' },
      },
    },
  ]);

  if (statics.length > 0) {
    await Tour.updateOne(
      { _id: tourId },
      {
        ratingsAverage: statics[0].average,
        ratingsQuantity: statics[0].count,
      }
    );
  } else {
    await Tour.updateOne(
      { _id: tourId },
      { ratingsAverage: 4.5, ratingsQuantity: 0 }
    );
  }
};

reviewSchema.pre(/^findOneAnd/, async function (next) {
  const thisReview = await this.findOne();
  this.thisReview = thisReview;

  next();
});

reviewSchema.post(/^findOneAnd/, async function () {
  await this.thisReview.constructor.calcAverageRatings(this.thisReview.tour);
});

reviewSchema.pre(/^find/, function (next) {
  this.populate('tour').populate('user', '-active -__v');

  next();
});

reviewSchema.post('save', function () {
  this.constructor.calcAverageRatings(this.tour);
});

reviewSchema.index({ tour: 1, user: 1 }, { unique: true });

const Review = mongoose.model('Review', reviewSchema);

module.exports = Review;
