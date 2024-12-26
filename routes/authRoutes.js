const express = require('express');
const authController = require('../controllers/authController');
const catchAsync = require('../utils/catchAsync');

const authRoutes = express.Router();

authRoutes.route('/sign-up').post(catchAsync(authController.signUp));
authRoutes.route('/sign-in').post(catchAsync(authController.signIn));
authRoutes
  .route('/forgot-password')
  .post(catchAsync(authController.forgotPassword));
authRoutes
  .route('/reset-password/:token')
  .patch(catchAsync(authController.resetPassword));

authRoutes
  .route('/update-password')
  .patch(authController.protect, catchAsync(authController.updatePassword));

authRoutes
  .route('/delete-me')
  .put(authController.protect, catchAsync(authController.deleteMe));

  
module.exports = authRoutes;
