const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const { Server } = require('socket.io');
const rateLimit = require('express-rate-limit');
const { ipKeyGenerator } = require('express-rate-limit');
const initSocket = require('./v1/services/socket');
const { setIO } = require('./v1/services/socket/io');
const { initializeCronJobs } = require('./v1/services/cronJobs');
// const helmet = require('helmet');
// const mongoSanitize = require('express-mongo-sanitize');
// const xss = require('xss-clean');

dotenv.config({ path: './main.env' });

const ErrorHandler = require('./v1/utils/globalErrorHandler');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
// app.use(helmet());
// app.use(mongoSanitize());
// app.use(xss());

// Rate Limiting Middleware
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: process.env.NODE_ENV === 'development' ? 2000 : 100,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req, res) => {
    // Logged-in users → per user ID
    if (req.user?.id) {
      return `user-${req.user.id}`;
    }

    // Device ID header
    if (req.headers['x-device-id']) {
      return `device-${req.headers['x-device-id']}`;
    }

    // Safe IP fallback (handles IPv6 properly)
    return ipKeyGenerator(req);
  },
  message: {
    status: 'fail',
    message: 'Too many requests, please try again later.',
  },
});

// Apply rate limiting to all API routes
app.use('/api/', apiLimiter);

// Database connection
let URI;
if (process.env.NODE_ENV === 'development') {
  URI = process.env.DEVELOPMENT_DATABASE_URI;
} else {
  URI = process.env.DATABASE_URI.replace(
    '<user>',
    process.env.DATABASE_USER
  ).replace('<password>', process.env.DATABASE_PASSWORD);
}

// Function to start the server after DB connection
const startServer = async () => {
  // Routes
  const userRoute = require('./v1/routes/user');
  const organizationRoute = require('./v1/routes/organization');
  const authRoute = require('./v1/routes/auth');
  const categoryRoute = require('./v1/routes/category');
  const analyticsRoute = require('./v1/routes/analytics');
  const adminRoute = require('./v1/routes/admin');
  const codeRoute = require('./v1/routes/code');
  const examTypeRoute = require('./v1/routes/examType');
  const examRoute = require('./v1/routes/exam');
  const subjectRoute = require('./v1/routes/subject');
  const questionRoute = require('./v1/routes/question');
  const newsletterRoute = require('./v1/routes/newsletter');
  const examCategoryRoute = require('./v1/routes/examCategory');
  const examModeRoute = require('./v1/routes/examMode');
  const examCardRoute = require('./v1/routes/examCards');
  const resultRoute = require('./v1/routes/result');
  const examModeResultRoute = require('./v1/routes/examResult');
  const notificationRoute = require('./v1/routes/notification');
  const userNotificationRoute = require('./v1/routes/userNotification');

  app.use('/api/v1/users', userRoute);
  app.use('/api/v1/organization', organizationRoute);
  app.use('/api/v1/auth', authRoute);
  app.use('/api/v1/category', categoryRoute);
  app.use('/api/v1/analytics', analyticsRoute);
  app.use('/api/v1/admin', adminRoute);
  app.use('/api/v1/code', codeRoute);
  app.use('/api/v1/exam-type', examTypeRoute);
  app.use('/api/v1/exams', examRoute);
  app.use('/api/v1/subjects', subjectRoute);
  app.use('/api/v1/questions', questionRoute);
  app.use('/api/v1/newsletter', newsletterRoute);
  app.use('/api/v1/exam-category', examCategoryRoute);
  app.use('/api/v1/exam-mode', examModeRoute);
  app.use('/api/v1/exam-card', examCardRoute);
  app.use('/api/v1/results', resultRoute);
  app.use('/api/v1/exam-mode-result', examModeResultRoute);
  app.use('/api/v1/notification', notificationRoute);
  app.use('/api/v1/user-notification', userNotificationRoute);
  // Catch-all route for undefined routes
  app.use('/api/v1/test', (req, res) => {
    res.status(404).json({
      status: 'fail',
      message: `Route ${req.originalUrl} not found on this server`,
    });
  });

  // Error handling middleware
  app.use(ErrorHandler);

  // Server
  const PORT = process.env.PORT || 5000;
  const server = app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });

  const io = new Server(server, {
    cors: {
      origin: [
        'http://localhost:3000',
        'http://localhost:3001',
        'http://localhost:3002',
        /\.vercel\.app$/, // Allow any subdomain of vercel.app
      ],
      methods: ['GET', 'POST'],
    },
  });

  initSocket(io);
  await setIO(io);

  // Initialize cron jobs
  initializeCronJobs();
};

mongoose
  .connect(URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log('DB connection successful');
    // Call startServer as an async function and handle any errors
    startServer().catch((err) => {
      console.error('Error starting server:', err);
      process.exit(1);
    });
  })
  .catch((err) => {
    console.error('DB connection failed', err);
    process.exit(1); // Exit the process if DB connection fails
  });
