const express = require('express');
const User = require('../models/users');
const Admin = require('../models/admins');
const { protect } = require('../middlewares/protectRoute');
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
  token,
  getCreatedUserDetails,
} = require('../controllers/authentication');

const Router = express.Router();

// Create Organization admin User
Router.route('/create-admin').post(createMainUserAccount);

// Verify Organization admin User
Router.route('/verify-admin/:token').post(verifyMainUserAccount);

// Login
Router.route('/login').post(login(User));

// Login
// Router.route('/login-admin').post(loginMainUser);
Router.route('/login-admin').post(loginMainUser);

// Login with 2FA
Router.route('/login-2fa/:token').post(LoginWith2Fa(User));

// Login with 2FA
Router.route('/admin-login-2fa/:token').post(LoginWith2Fa(Admin));

// Verify Email
Router.route('/verify-email/:token').post(verifyEmail(User));

// Logout
Router.route('/logout').post(protect(User), Logout);

// Logout Admin
Router.route('/logout-admin').post(protect(Admin), Logout);

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

// Admin Reset Password
Router.route('/admin-reset-password/:token').post(resetPassword(Admin));

// Update Password
Router.route('/update-password').post(protect(User), updatePassword);

// Admin Update Password
Router.route('/update-admin-password').post(protect(Admin), updatePassword);

// Complete Admin Creation
Router.route('/complete-admin-creation/:id').post(completeAdminCreation);

// Get Created Admin Details
Router.route('/get-created-admin-details/:id').get(getCreatedAdminDetails);

Router.route('/get-created-user-details/:id').get(getCreatedUserDetails);

// Resend 2FA Code
Router.route('/resend-2fa-code/:token').post(resend2FACode(User));

Router.route('/admin-resend-2fa-code/:token').post(resend2FACode(Admin));

// Resent Email Verification Code
Router.route('/resend-email-verification-code/:token').post(
  resendEmailVerificationCode(User)
);

// Forgot Password for User
Router.route('/forgot-password').post(forgetPassword(User));

// Forget Password for Admin
Router.route('/forgot-password-admin').post(forgetPassword(Admin));

Router.route('/add-user').post(generateAndSendUserAuthLink);

Router.route('/token').post(token(User));

Router.route('/admin-token').post(token(Admin));

Router.route('/signup-user-link/:id').post(continueUserAccountCreationByLink);

module.exports = Router;
