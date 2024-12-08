const express = require('express');
const catchAsync = require('../utils/catchAsync');
const userController = require('../controllers/userController');

const userRoutes = express.Router();

userRoutes
  .route('/')
  .get(catchAsync(userController.GetAllUsers))
  .post(catchAsync(userController.CreateUser));

userRoutes
  .route('/:id')
  .get(catchAsync(userController.getUserById))
  .delete(catchAsync(userController.DeleteUser))
  .patch(catchAsync(userController.UpdateUser));

module.exports = userRoutes;
