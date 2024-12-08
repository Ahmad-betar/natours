const AppError = require('../utils/appError');

const handleCastErrorDB = (error) => {
  const message = `Invalid ${error.path}: ${error.value}`;

  return new AppError(message, 400);
};

const handleValidatorErrorDB = (error) => {
  return new AppError(error.message, 400);
};

const handleMongoServerErrorDB = (error) => {
  const message = `Duplicated Value : ${JSON.stringify(
    error.keyValue
  ).replaceAll('"', ' ')}`;

  return new AppError(message, 400);
};

const handleJWTError = () => {
  const message = 'Invalid token. Please try again';

  return new AppError(message, 401);
};

const handleExpiredToken = () => {
  const message = 'Token expired. Please log in again';

  return new AppError(message, 401);
};

const sendErrorProd = (err, res) => {
  res.status(err.statusCode || 500).json({
    status: err.status || 'error',
    message: err.message || 'Internal Server Error',
  });
};

const sendErrorDev = (err, res) => {
  if (err.isOperational) {
    //user error
    console.log('user');

    res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
      error: err,
      stack: err.stack,
    });
  } else {
    // server Error
    console.log('server');

    res.status(500).json({
      status: err.status || 'error',
      message: err.message || 'Internal Server Error',
    });
  }
};

module.exports = (err, req, res, next) => {
  if (process.env.NODE_ENV === 'production') {
    sendErrorProd(err, res);
  } else if (process.env.NODE_ENV === 'development') {
    let error = { ...err, message: err.message, name: err.name };

    console.log(error);

    if (error.name === 'CastError') {
      error = handleCastErrorDB(error);
    }

    if (error.name === 'ValidationError') {
      error = handleValidatorErrorDB(error);
    }

    if (error.name === 'MongoServerError') {
      error = handleMongoServerErrorDB(error);
    }

    if (error.name === 'JsonWebTokenError') {
      error = handleJWTError(error);
    }

    if (error.name === 'TokenExpiredError') {
      error = handleExpiredToken(error);
    }

    sendErrorDev(error, res);
  }

  next();
};
