const jwt = require('jsonwebtoken');
const User = require('../models/userModel');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
const sendEmail = require('../utils/Email');
const { cn } = require('../utils/cn');
const crypto = require('crypto');
const bcrypt = require('bcryptjs');

const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_END_AT,
  });
};

const createSendToken = (user, statusCode, res) => {
  const token = signToken(user._id);

  res.cookie('jwt', token, {
    expires: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
  });

  // Remove password from output
  user.password = undefined;

  res.status(statusCode).send({
    status: 'success',
    token,
    data: {
      user,
    },
  });
};

exports.signUp = async (req, res, next) => {
  const user = await User.create(req.body);

  if (!user) {
    next(new AppError('User is not created', 400));
  }

  createSendToken(user, 200, res);
};

exports.signIn = async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return next(new AppError('email and passwrod is required', 400));
  }

  const user = await User.findOne({ email }).select('+password');

  //to make it faster
  //if there is no user correct method will not be triggered
  if (!user || !(await user.correctPassword(password, user.password)))
    return next(new AppError('Incorrect Email or Password', 401));

  user.password = undefined;

  return createSendToken(user, 200, res);
};

exports.protect = catchAsync(async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  //check if user is authorized
  if (!token) {
    return next(new AppError("Unauthorized: You're not logged in.", 401));
  }

  const decoded = jwt.verify(token, process.env.JWT_SECRET);

  const user = await User.findById(decoded.id);

  //if user is no longer exist
  if (!user) {
    return next(new AppError('Unauthorized: User not found.', 401));
  }

  //if user changed password
  if (user.changedPasswordAfter(decoded.iat)) {
    return next(
      new AppError(
        'Unauthorized: User recently changed password. Please login again.',
        401
      )
    );
  }

  req.user = user;

  next();
});

exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(
        new AppError('You do not have permission to perform this action', 403)
      );
    }

    next();
  };
};

exports.forgotPassword = async (req, res, next) => {
  if (!req.body.email) {
    next(new AppError('Email is Required', 400));
  }

  const user = await User.findOne({ email: req.body.email });

  if (!user) {
    next(new AppError('User does not exist', 400));
  }

  //generate random token to reset password
  const token = user.createPasswordResetToken();
  await user.save();

  //send email with reset link
  const resetURL = cn(
    req.protocol,
    '://',
    req.get('host'),
    '/api/v1/resetPassword/',
    token
  );

  const message = cn('forgot your password?\n', resetURL);

  try {
    await sendEmail({
      email: user.email,
      subject: 'your password reset token invalid for 10 min',
      message,
    });

    res.status(200).send({
      status: 'success',
      message: 'Token sent to email',
    });
  } catch (error) {
    User.passwordResetToken = undefined;
    User.passwordResetExpires = undefined;

    user.save();

    next(new AppError('Something went wrong', 400));
  }
};

exports.resetPassword = async (req, res, next) => {
  const hashedToken = crypto
    .createHash('sha256')
    .update(req.params.token)
    .digest('hex');

  if (!req.body.password || !req.body.passwordConfirm) {
    return next(
      new AppError('Password and Confirm Password are required', 400)
    );
  }

  if (req.body.password !== req.body.passwordConfirm) {
    return next(new AppError('Password and Confirm Password must match', 400));
  }

  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() },
  });

  if (!user) {
    return next(new AppError('Token is invalid or has expired', 400));
  }

  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;

  await user.save();

  return createSendToken(user, 200, res);
};

exports.updatePassword = async (req, res, next) => {
  //get the user password and make sure it right
  const password = req.body.password;
  const newPassword = req.body.newPassword;
  const passwordConfirm = req.body.passwordConfirm;

  const user = await User.findById(req.user.id).select('+password');

  //check if the user provided the correct current password
  if (!(await user.correctPassword(password, user.password))) {
    return next(new AppError('Incorrect current password', 400));
  }

  //check if its equal
  if (newPassword !== passwordConfirm) {
    return next(
      new AppError('New password and Confirm Password must match', 400)
    );
  }

  const hashedPass = await bcrypt.hash(newPassword, 12);

  //hash the new password
  user.password = hashedPass;
  user.passwordConfirm = hashedPass;
  user.passwordChangedAt = Date.now();
  await user.save();

  return createSendToken(user, 200, res);
};

exports.deleteMe = async (req, res, next) => {
  const deletedUser = await User.updateOne(
    { _id: req.user.id },
    { active: false },
    { new: true }
  );

  if (!deletedUser.acknowledged) {
    return next(new AppError('User could not be deleted', 400));
  }

  res.send({
    status: 'success',
    message: 'User deleted successfully',
  });
};
