const Tour = require('../models/tourModel');
const AppError = require('../utils/appError');
const { cn } = require('../utils/cn');
const {
  deleteDocument,
  updateDocument,
  createDocument,
  getOneDocument,
  getDocuments,
} = require('./handleFactory');

//get
exports.GetAllTours = getDocuments(Tour);

//post
exports.CreateTour = createDocument(Tour);

//get by id
exports.getTourById = getOneDocument(Tour);

//update
exports.UpdateTour = updateDocument(Tour);

//delete
exports.DeleteTour = deleteDocument(Tour);

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
