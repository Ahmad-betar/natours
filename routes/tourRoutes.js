const express = require('express');
const catchAsync = require('../utils/catchAsync');
const tourController = require('./../controllers/tourController');
const authController = require('./../controllers/authController');
const reviewController = require('./../controllers/reviewController');
const { protect } = require('../controllers/authController');

const tourRoutes = express.Router();

tourRoutes.use(protect);

tourRoutes
  .route('/')
  .get(catchAsync(tourController.GetAllTours))
  .post(
    authController.restrictTo('admin', 'lead-guide'),
    catchAsync(tourController.CreateTour)
  );

tourRoutes.route('/month/:year').get(catchAsync(tourController.getMonthlyplan));

tourRoutes
  .route('/:id')
  .get(catchAsync(tourController.getTourById))
  .delete(
    authController.restrictTo('admin', 'lead-guide'),
    catchAsync(tourController.DeleteTour)
  )
  .patch(
    authController.restrictTo('admin', 'lead-guide'),
    catchAsync(tourController.UpdateTour)
  );

module.exports = tourRoutes;
