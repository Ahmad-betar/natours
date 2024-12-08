const fs = require('fs');
const User = require('../models/userModel');
const AppError = require('../utils/appError');

// const users = JSON.parse(
//   fs.readFileSync(`${__dirname}/../dev-data/data/users.json`, 'utf-8')
// );

exports.GetAllUsers = async (req, res, next) => {
  const users = await User.find();

  return res.status(200).send({
    status: 'success',
    users,
  });
};

exports.CreateUser = (req, res) => {};

exports.UpdateUser = async (req, res, next) => {
  const user = await User.findByIdAndUpdate(
    { _id: req.params.id },
    { $set: req.body },
    { new: true, runValidators: true }
  );

  if (!user) {
    next(new AppError("user isn't found", 400));
  }

  return res.status(200).send({ status: 'success', user });
};

exports.getUserById = async (req, res, next) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    next(new AppError("user isn't found", 400));
  }

  return res.status(200).send({ status: 'success', user });
};

exports.DeleteUser = async (req, res, next) => {
  const user = await User.findOneAndDelete(req.params.id);

  if (!user) {
    next(new AppError("user isn't found", 400));
  }

  return res.status(200).send({ status: 'success', user });
};

//middleWare
