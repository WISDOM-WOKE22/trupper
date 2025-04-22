const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const mongoose = require('mongoose');

dotenv.config({ path: './main.env' });

const ErrorHandler = require('./v1/utils/globalErrorHandler');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
// app.use(express.urlencoded({ extended: true }));
// app.use((req, res, next) => {
//   req.requestTime = new Date().toISOString();
//   next();
// });

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

mongoose
  .connect(URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log('DB connection successful'))
  .catch((err) => console.log('DB connection failed', err));

// Routes
// Add your route handlers here before the catch-all route
const userRoute = require("./v1/routes/user");


app.use("/api/v1/users", userRoute)

// Catch-all route for undefined routes
// app.use('*', (req, res) => {
//   res.status(404).json({
//     status: 'fail',
//     message: `Route ${req.originalUrl} not found on this server`
//   });
// });

// Error handling middleware
app.use(ErrorHandler);

// Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
