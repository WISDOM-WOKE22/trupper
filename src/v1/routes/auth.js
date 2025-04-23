const express = require('express');
const User = require('../models/users');
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
} = require('../controllers/authentication');

const Router = express.Router();

Router.route('/login').post(login(User));
Router.route('/login-2fa').post(LoginWith2Fa);
Router.route('/verify-email').post(verifyEmail);
Router.route('/logout').post(Logout);
Router.route('/logout-all-devices').post(logOutAllDevices);
Router.route('/create-sub-admin').post(createSubAdmin);
Router.route('/create-user').post(createUser);
Router.route('/reset-password').post(resetPassword);
Router.route('/update-password').post(updatePassword);
Router.route('/complete-admin-creation').post(completeAdminCreation);
Router.route('/get-created-admin-details').post(getCreatedAdminDetails);
Router.route('/resend-2fa-code').post(resend2FACode);
Router.route('/resend-email-verification-code').post(
  resendEmailVerificationCode
);
Router.route('/forgot-password').post(forgetPassword);

module.exports = Router;
