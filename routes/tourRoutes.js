const express = require('express');
const catchAsync = require('../utils/catchAsync');
const tourController = require('./../controllers/tourController');
const authController = require('./../controllers/authController');
const { protect } = require('../controllers/authController');

const tourRoutes = express.Router();

tourRoutes.use(protect);

tourRoutes
  .route('/')
  .get(catchAsync(tourController.GetAllTours))
  .post(catchAsync(tourController.CreateTour));

tourRoutes.route('/month/:year').get(catchAsync(tourController.getMonthlyplan));

tourRoutes
  .route('/:id')
  .get(
    authController.restrictTo('admin', 'lead-guide'),
    catchAsync(tourController.getTourById)
  )
  .delete(catchAsync(tourController.DeleteTour))
  .patch(catchAsync(tourController.UpdateTour));

module.exports = tourRoutes;
