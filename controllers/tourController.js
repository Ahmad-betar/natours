const Tour = require('../models/tourModel');
const AppError = require('../utils/appError');
const { cn } = require('../utils/cn');
const APIFeatures = require('./../utils/apiFeatures');

//get
exports.GetAllTours = async (req, res, next) => {
  const page = req.params.page;

  const tours = await Tour.find();

  res.status(200).json({
    status: 'success',
    results: tours.length,
    requestedAt: req.requestTime,
    data: {
      tours,
    },
  });
};

//post
exports.CreateTour = async (req, res) => {
  const newTour = await Tour.create(req.body);

  if (!newTour) {
    return next(new AppError('No tour found with this ID', 400));
  }

  res.status(200).send({
    status: 'success',
    requestedAt: req.requestTime,
    data: {
      tour: newTour,
    },
  });
};

//get by id
exports.getTourById = async (req, res, next) => {
  const tour = await Tour.findById(req.params.id);

  if (!tour) {
    return next(new AppError('No tour found with this ID', 400));
  }

  res.status(200).send({
    status: 'success',
    requestedAt: req.requestTime,
    data: {
      tour,
    },
  });
};

//delete
exports.DeleteTour = async (req, res, next) => {
  const id = req.params.id;

  const tour = await Tour.findOneAndDelete({ _id: id });
  console.log(tour);

  if (!tour) {
    return next(new AppError('No tour found with this ID', 400));
  }

  res.status(200).send({
    status: 'success',
    requestedAt: req.requestTime,
    data: {
      tour,
    },
  });
};

//update
exports.UpdateTour = async (req, res, next) => {
  const id = req.params.id;

  const tour = await Tour.findByIdAndUpdate(
    { _id: id },
    { $set: req.body },
    { new: true, runValidators: true }
  );

  if (!tour) {
    return next(new AppError('No tour found with this ID', 400));
  }

  res.status(200).send({
    status: 'success',
    requestedAt: req.requestTime,
    data: {
      tour,
    },
  });
};

exports.getMonthlyplan = async (req, res) => {
  const year = Number(req.params.year);

  const plan = await Tour.aggregate([
    {
      $unwind: '$startDates',
    },
    {
      $group: {
        _id: { $month: '$startDates' },
        num: { $sum: 1 },
        tours: { $push: '$name' },
      },
    },
    {
      $addFields: { month: '$_id' },
    },
    {
      $project: {
        _id: 0,
      },
    },
    {
      $sort: { num: 1 },
    },
  ]);

  res.send(plan);
};

//middleWare
exports.checkBody = (req, res, next) => {
  if (!req.body.price && !req.body.name) {
    res.status(400).send('Name and price must be provided');
  }

  next();
};
