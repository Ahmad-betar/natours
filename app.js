const express = require('express');
const tourRoutes = require('./routes/tourRoutes');
const userRoutes = require('./routes/userRoutes');
const authRoutes = require('./routes/authRoutes');
const errorController = require('./controllers/errorController');
const AppError = require('./utils/appError');
const { rateLimit } = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');


const ratelimiterMiddleware = rateLimit({
  windowMs: 1000 * 60 * 60,
  limit: 100,
  message: 'Too many requests from this IP, please try again after an hour',
});

const app = express();
app.use(express.json());

app.use('/api', ratelimiterMiddleware);

app.use(helmet());

app.use(mongoSanitize());

app.use(xss());

app.use(hpp());

app.use((req, res, next) => {
  const query = { ...req.query };
  const excludedFileds = ['sort', 'limit', 'fields'];

  excludedFileds.forEach((el) => delete query[el]);
  req.query = query;

  next();
});

app.use(express.static(`${__dirname}/public`));
app.use('/api/v1/users', userRoutes);
app.use('/api/v1/tours', tourRoutes);
app.use('/api/v1/auth', authRoutes);

app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();

  next();
});

app.all('*', (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

app.use(errorController);

module.exports = app;
