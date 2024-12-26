const Review = require('../models/reviewModel');
const AppError = require('../utils/appError');
const User = require('../models/userModel');
const Tour = require('../models/tourModel');
const {
  deleteDocument,
  updateDocument,
  createDocument,
  getOneDocument,
  getDocuments,
} = require('./handleFactory');

exports.checkUserTour = async (req, res, next) => {
  if (!(await User.findById(req.body.user))) {
    return next(new AppError('User Not Found', 404));
  }

  if (!(await Tour.findById(req.body.tour))) {
    return next(new AppError('Tour Not Found', 404));
  }

  next();
};

exports.getReviews = getDocuments(Review);

exports.getReview = getOneDocument(Review);

exports.createReview = createDocument(Review);

exports.updateReview = updateDocument(Review);

exports.deleteReview = deleteDocument(Review);
