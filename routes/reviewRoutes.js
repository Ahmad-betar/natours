const express = require('express');
const catchAsync = require('../utils/catchAsync');
const { protect } = require('../controllers/authController');
const {
  getReviews,
  createReview,
  deleteReview,
  getReview,
  checkUserTour,z
} = require('../controllers/reviewController');

const reviewRoutes = express.Router();

reviewRoutes.use(protect);

reviewRoutes
  .route('/')
  .get(catchAsync(getReviews))
  .post(catchAsync(checkUserTour), catchAsync(createReview));

reviewRoutes
  .route('/:id')
  .get(catchAsync(getReview))
  .patch(catchAsync(getReviews))
  .delete(catchAsync(deleteReview));

module.exports = reviewRoutes;
