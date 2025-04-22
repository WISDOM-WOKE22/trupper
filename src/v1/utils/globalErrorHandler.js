const AppError = require('./appError');

/**
 * Global Error Handler
 * Handles all errors in the application and sends appropriate response
 * @param {Error} error - Error object
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 * @param {NextFunction} next - Express next function
 */
const ErrorHandler = (error, req, res, next) => {
  // Set defaults
  error.statusCode = error.statusCode || 500;
  error.status = error.status || 'error';
  error.isOperational = error.isOperational || false;
  // Specific error handlers
  if (process.env.NODE_ENV === 'development') {
    sendDevError(error, req, res);
  } else {
    let processedError = { ...error };

    // Handle specific error cases
    if (error.name === 'CastError') {
      processedError = handleCastError(error);
    }
    if (error.code === 11000) {
      processedError = handleDuplicateKeyError(error);
    }
    if (error.name === 'ValidationError') {
      processedError = handleValidationError(error);
    }
    if (error.name === 'JsonWebTokenError') {
      processedError = handleJWTError();
    }
    if (error.name === 'TokenExpiredError') {
      processedError = handleJWTExpiredError();
    }

    sendProdError(processedError, req, res);
  }
};

// Development error response
const sendDevError = (error, req, res) => {
  // API Error
  if (req.originalUrl.startsWith('/api')) {
    return res.status(error.statusCode).json({
      status: error.status,
      message: error.message,
      stack: error.stack,
      error: error,
    });
  }

  // Rendered Website Error
  console.error('ERROR 💥', error);
  return res.status(error.statusCode).render('error', {
    title: 'Something went wrong!',
    message: error.message,
  });
};

// Production error response
const sendProdError = (error, req, res) => {
  // API Operational Error
  if (req.originalUrl.startsWith('/api')) {
    if (error.isOperational) {
      return res.status(error.statusCode).json({
        status: error.status,
        message: error.message,
      });
    }
    // Programming or unknown error: don't leak details
    console.error('ERROR 💥', error);
    return res.status(500).json({
      status: 'error',
      message: 'Something went wrong!',
    });
  }

  // Rendered Website Error
  if (error.isOperational) {
    return res.status(error.statusCode).render('error', {
      title: 'Something went wrong!',
      message: error.message,
    });
  }

  console.error('ERROR 💥', error);
  return res.status(error.statusCode).render('error', {
    title: 'Something went wrong!',
    message: 'Please try again later.',
  });
};

// Specific Error Handlers
const handleCastError = (err) => {
  const message = `Invalid ${err.path}: ${err.value}`;
  return new AppError(message, 400);
};

const handleDuplicateKeyError = (err) => {
  const value = err.errmsg.match(/(["'])(\\?.)*?\1/)[0];
  const message = `Duplicate field value: ${value}. Please use another value!`;
  return new AppError(message, 400);
};

const handleValidationError = (err) => {
  const errors = Object.values(err.errors).map((el) => el.message);
  const message = `Invalid input data. ${errors.join('. ')}`;
  return new AppError(message, 400);
};

const handleJWTError = () =>
  new AppError('Invalid token. Please log in again!', 401);

const handleJWTExpiredError = () =>
  new AppError('Your token has expired! Please log in again.', 401);

module.exports = ErrorHandler;
