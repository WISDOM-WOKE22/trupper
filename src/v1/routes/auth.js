const express = require('express');
const User = require('../models/users');
const Admin = require('../models/admins');
const {
  login,
  resetPassword,
  updatePassword,
  verifyEmail,
  LoginWith2Fa,
  completeAdminCreation,
  Logout,
  createSubAdmin,
  createUser,
  forgetPassword,
  getCreatedAdminDetails,
  logOutAllDevices,
  resend2FACode,
  resendEmailVerificationCode,
  createMainUserAccount,
  verifyMainUserAccount,
  loginMainUser,
  continueUserAccountCreationByLink,
  generateAndSendUserAuthLink,
} = require('../controllers/authentication');

const Router = express.Router();

// Create Organization admin User
Router.route('/create-admin').post(createMainUserAccount);

// Verify Organization admin User
Router.route('/verify-admin/:token').post(verifyMainUserAccount);

// Login
Router.route('/login').post(login(User));

// Login
Router.route('/login-admin').post(loginMainUser);

// Login with 2FA
Router.route('/login-2fa').post(LoginWith2Fa(User));

// Verify Email
Router.route('/verify-email/:token').post(verifyEmail(User));

// Logout
Router.route('/logout').post(Logout);

// Logout from all devices
Router.route('/logout-all-devices/:id').post(logOutAllDevices(User));

// Logout from all devices
Router.route('/logout-all-devices/:id').post(logOutAllDevices(Admin));

// Create Sub Admin
Router.route('/create-sub-admin').post(createSubAdmin);

// Create User / Signup for organization user
Router.route('/signup').post(createUser);

// Reset Password
Router.route('/reset-password/:token').post(resetPassword(User));

// Update Password
Router.route('/update-password').post(updatePassword);

// Complete Admin Creation
Router.route('/complete-admin-creation').post(completeAdminCreation);

// Get Created Admin Details
Router.route('/get-created-admin-details').post(getCreatedAdminDetails);

// Resend 2FA Code
Router.route('/resend-2fa-code').post(resend2FACode);

// Resent Email Verification Code
Router.route('/resend-email-verification-code/:token').post(
  resendEmailVerificationCode(User)
);

// Forgot Password for User
Router.route('/forgot-password/:id').post(forgetPassword(User));

// Forget Password for Admin
Router.route('/forgot-password-admin').post(forgetPassword(Admin));

Router.route('/add-user').post(generateAndSendUserAuthLink);

Router.route('/signup-user-link/:id').post(continueUserAccountCreationByLink);

module.exports = Router;
