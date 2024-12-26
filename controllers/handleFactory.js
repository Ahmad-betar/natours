const AppError = require('../utils/appError');

exports.updateDocument = (Model) => async (req, res, next) => {
  const doc = await Model.findByIdAndUpdate(
    { _id: req.params.id },
    { $set: req.body },
    { new: true, runValidators: true }
  );

  if (!doc) {
    return next(new AppError('No tour found with this ID', 400));
  }

  res.status(200).send({
    status: 'success',
    requestedAt: req.requestTime,
    data: doc,
  });
};

exports.createDocument = (Model) => async (req, res, next) => {
  const doc = await Model.create(req.body);

  if (!doc) {
    return next(new AppError('Review not created', 400));
  }

  res.send({
    status: 'success',
    doc,
  });
};

exports.getOneDocument = (Model) => async (req, res, next) => {
  const doc = await Model.findById(req.params.id);

  if (!doc) {
    return next(new AppError('No tour found with this ID', 400));
  }

  res.status(200).send({
    status: 'success',
    requestedAt: req.requestTime,
    data: doc,
  });
};

exports.getDocuments = (Model) => async (req, res, next) => {
  const doc = await Model.find();

  return res.status(200).send({
    status: 'success',
    results: doc.length,
    doc,
  });
};

exports.deleteDocument = (Model) => async (req, res, next) => {
  const doc = await Model.findOneAndDelete({ _id: req.params.id });

  if (!doc) {
    return next(new AppError('not found', 404));
  }

  res.status(200).send({
    status: 'success',
    message: 'deleted successfully',
  });
};
