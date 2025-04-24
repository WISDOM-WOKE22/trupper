const User = require('../models/users');
const Organization = require('../models/organization');
const Admin = require('../models/admins');
const Email = require('../services/email/email');
const parser = require('ua-parser-js');
const requestIp = require('request-ip');
const crypto = require('crypto');
const {
  badResponse,
  goodResponseDoc,
  goodResponse,
  goodResponseCustom,
} = require('../utils/response');
const { consoleError, consoleMessage } = require('../utils/console');
const {
  jwtToken,
  randomToken,
  generateCode,
  verifyJwt,
  multiplePayLoadJwtToken,
} = require('../utils/token');

// CREATE USER
exports.createUser = async (req, res, next) => {
  try {
    const {
      firstName,
      lastName,
      email,
      phone,
      organization,
      password,
      confirmPassword,
    } = req.body;

    if (!firstName) return badResponse(res, 'First Name is missing');
    if (!lastName) return badResponse(res, 'Last Name is Required');
    if (!email) return badResponse(res, 'Enter contact information');
    if (!organization)
      return badResponse(res, 'Please provide an organization Id');
    if (!password) return badResponse(res, 'Password is required');
    if (password.length < 8)
      return badResponse(res, 'Password should be more than 8 characters');
    if (!confirmPassword)
      return badResponse(res, 'Confirm Password is required');
    if (password !== confirmPassword)
      return badResponse(res, "Passwords don't match");

    const checkOrganization = await Organization.findById(organization);

    if (!checkOrganization) {
      return badResponse(res, 'Organization not found');
    }

    const emailCheck = await User.findOne({
      email,
      organization: checkOrganization.id,
    }).populate({ path: 'organization' });

    if (emailCheck) {
      return badResponse(res, 'Email already used');
    }

    const user = await User.create({
      firstName,
      lastName,
      email: email.toLowerCase(),
      phone,
      organization: checkOrganization.id,
      password,
      confirmPassword,
    });

    if (!user) return badResponse(res, 'Failed to create user');
    const token = jwtToken(user._id, user.email);
    const verificationCode = generateCode();
    user.verificationCode = verificationCode;
    await user.save({ validateBeforeSave: false });
    const url = `${req.protocol}://${req.get(
      'host'
    )}/api/v1/auth/verify/${token}`;
    const message = `Welcome to our platform, ${user.firstName} ${user.lastName}. Please verify your email by clicking on the link: ${url}`;
    await new Email(user, user, "" ,verificationCode).verifyEmail(message);
    return goodResponseDoc(res, 'User created successfully', 201, user);
  } catch (error) {
    next(error);
  }
};

// CREATE SUB ADMIN
exports.createSubAdmin = async (req, res, next) => {
  try {
    const { firstName, lastName, email, organization } = req.body;
    if (!firstName) return badResponse(res, 'first name is missing');
    if (!lastName) return badResponse(res, 'last name is missing');
    if (!email) return badResponse(res, 'Email is missing');

    const checkOrganization = await Organization.findById(organization);

    if (!checkOrganization) {
      return badResponse(res, 'Organization not found');
    }

    const subAdmin = await Admin.create({
      email,
      firstName,
      lastName,
      role: 'sub_admin',
      organization: checkOrganization.id,
    });

    const token = await subAdmin.createVerificationToken();
    await subAdmin.save({ validateBeforeSave: false });

    const url = `${process.env.SUPER_WEB_URL}/register/admin/${token}`;

    await new Email(res, subAdmin, url, '').addAdmin();

    goodResponse(res, 'Sub Admin Created Successfully');
  } catch (error) {
    if (error.code === 11000) {
      return badResponse(res, 'An Admin already exists with this Mail');
    }
    next(error);
  }
};

exports.createMainUserAccount = async (req, res, next) => {
  try {
    const {
      firstName,
      lastName,
      email,
      phone,
      password,
      confirmPassword,
      organizationName,
    } = req.body;
    if (!firstName) return badResponse(res, 'First Name is missing');
    if (!lastName) return badResponse(res, 'Last Name is Required');
    if (!email) return badResponse(res, 'Enter contact information');
    if (!password) return badResponse(res, 'Password is required');
    if (password.length < 8)
      return badResponse(res, 'Password should be more than 8 characters');
    if (!confirmPassword)
      return badResponse(res, 'Confirm Password is required');
    if (password !== confirmPassword)
      return badResponse(res, "Passwords don't match");

    if (!organizationName)
      return badResponse(res, 'Please provide an organization Name');

    const admin = await Admin.create({
      firstName,
      lastName,
      email: email.toLowerCase(),
      password,
      confirmPassword,
      phone,
    });

    if (!admin) return badResponse(res, 'Failed to create account');

    const verificationCode = generateCode();
    admin.verificationCode = verificationCode;
    await admin.save({ validateBeforeSave: false });
    await new Email(res, admin, '', verificationCode).verifyEmail();

    const token = multiplePayLoadJwtToken({
      id: admin._id,
      email: admin.email,
      organizationName,
    });

    goodResponseDoc(res, 'Account created successfully', 201, { token });
  } catch (error) {
    next(error);
  }
};

exports.verifyMainUserAccount = async (req, res, next) => {
  try {
    const { token } = req.params;
    const { verificationCode } = req.body;
    if (!token) return badResponse(res, 'Provide user Auth token');
    if (!verificationCode)
      return badResponse(res, 'Provide user verification code');
    const decodedToken = await verifyJwt(token);
    const user = await Admin.findOne({
      _id: decodedToken.id,
      verificationCode,
    });
    if (!user) return badResponse(res, 'Invalid Code');
    if (user.isBlocked)
      return badResponseCustom(
        res,
        404,
        'Blocked',
        'Account has been temporary suspended'
      );
    if (user.isVerified) return badResponse(res, 'Account already verified');
    console.log(decodedToken);

    const organization = await Organization.create({
      name: decodedToken.organizationName,
      email: user.email,
    });

    const newToken = jwtToken(user._id);
    const loginToken = randomToken();
    user.loginTokens = loginToken;
    user.verificationCode = undefined;
    user.isVerified = true;
    user.organization = organization.id;
    await user.save({ validateBeforeSave: false });
    await new Email(res, user, '', '').adminWelcome();
    const doc = {
      user,
      token: newToken,
      loginToken,
    };

    goodResponseDoc(res, 'Account Verified', 200, doc);
  } catch (error) {
    next(error);
  }
};

exports.loginMainUser = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email) return badResponse(res, 'Provide Email');
    if (!password) return badResponse(res, 'Provide Password');
    if (password.length <= 7)
      return badResponse(res, 'Password should be up to 8 characters');

    const user = await Admin.findOne({
      email: email.toLowerCase(),
    }).select('+password');

    if (!user || !(await user.correctPassword(password, user.password))) {
      return badResponse(res, 'Incorrect credentials');
    }

    if (user.isBlocked) {
      return badResponse(res, 'Account Temporary suspended');
    }

    const token = await jwtToken(user._id);
    const loginToken = randomToken();
    user.loginTokens = loginToken;
    user.lastLogin = Date.now();
    await user.save({ validateBeforeSave: false });

    const doc = {
      user,
      token,
      loginToken,
    };
    req.user = user;
    goodResponseDoc(res, 'You are logged in', 200, doc);
  } catch (error) {
    next(error);
  }
};

// COMPLETE SUB-ADMIN ACCOUNT CREATE
exports.completeAdminCreation = async (req, res, next) => {
  try {
    const loginToken = generateCode();
    const { id } = req.params;
    const { password, confirmPassword, organization } = req.body;
    if (!password) return badResponse(res, 'Password is missing');
    if (password.length <= 7)
      return badResponse(res, 'Password should be up to 8 characters');
    if (!confirmPassword) return badResponse(res, 'Confirm password');
    if (password !== confirmPassword)
      return badResponse(res, 'Password does not match');

    const clientIp = requestIp.getClientIp(req);
    const device = await parser(req.headers['user-agent']);

    const checkOrganization = await Organization.findById(organization);

    if (!checkOrganization) {
      return badResponse(res, 'Organization not found');
    }

    const hashedToken = await crypto
      .createHash('sha256')
      .update(id)
      .digest('hex');

    const admin = await Admin.findOne({ verificationToken: hashedToken });

    if (!admin) return badResponse(res, 'Invalid Credentials provided');

    admin.password = password;
    admin.confirmPassword = undefined;
    admin.passwordResetToken = undefined;

    admin.lastLogin = Date.now();
    admin.loginDetails = [{ device, clientIp }];
    admin.verificationToken = undefined;
    admin.isVerified = true;
    await admin.save({ validateBeforeSave: false });

    const token = await jwtToken(admin._id);
    const doc = {
      admin,
      token,
      loginToken,
    };
    req.user = admin;
    goodResponseDoc(res, 'You are logged in', 200, doc);
  } catch (error) {
    next(error);
  }
};

// GET CREATED ADMIN DETAILS
exports.getCreatedAdminDetails = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!id) return badResponse(res, 'Provide admin Details');

    const hashedToken = await crypto
      .createHash('sha256')
      .update(id)
      .digest('hex');

    const subAdmin = await Admin.findOne({ verificationToken: hashedToken });

    if (!subAdmin) return badResponse(res, 'Incorrect Details');

    goodResponseDoc(res, 'Admin Gotten', 200, subAdmin);
  } catch (error) {
    next(error);
  }
};

// VERIFY USER
exports.verifyEmail = (Model) => async (req, res, next) => {
  try {
    const { token } = req.params;
    const { verificationCode } = req.body;
    if (!token) return badResponse(res, 'Provide user Auth token');
    if (!verificationCode)
      return badResponse(res, 'Provide user verification code');

    const decodedToken = await verifyJwt(token);

    const user = await User.findOne({
      _id: decodedToken.id,
      verificationCode,
    }).populate({ path: 'organization' });

    if (!user) return badResponse(res, 'Invalid Code');

    const newToken = jwtToken(user._id);
    const loginToken = randomToken();
    user.loginTokens = loginToken;
    user.twoFactorVerificationCode = undefined;
    user.verificationCode = undefined;
    user.isVerified = true;
    await user.save({ validateBeforeSave: false });

    await new Email(res, user, '', '').welcome();

    const doc = {
      user,
      token: newToken,
      loginToken,
    };
    goodResponseDoc(res, 'User email verified', 200, doc);
  } catch (error) {
    next(error);
  }
};

// RESEND EMAIL VERIFICATION CODE
exports.resendEmailVerificationCode = (Model) => async (req, res, next) => {
  try {
    const { token } = req.params;
    if (!token) return badResponse(res, 'Provide user auth token');
    const decodedToken = await verifyJwt(token);

    const user = await Model.findOne({ _id: decodedToken.id });
    if (!user) return badResponse(res, 'User does not exist');
    if (user.isVerified) return badResponse(res, 'User already verified');
    const verificationCode = generateCode();
    (await user).verificationCode = verificationCode;
    await user.save({ validateBeforeSave: false });
    await new Email(res, user, '', verificationCode).verifyEmail();
    req.user = user;
    goodResponse(res, 'OTP sent to email');
  } catch (error) {
    next(error);
  }
};

// LOGIN USER
exports.login = (Model) => async (req, res, next) => {
  try {
    const { email, password, organization } = req.body;
    const loginToken = randomToken();
    if (!email) return badResponse(res, 'Provide Email');
    if (!organization) return badResponse(res, 'Provide Organization Id');
    if (!password) return badResponse(res, 'Provide Password');
    if (password.length <= 7)
      return badResponse(res, 'Password should be up to 8 characters');

    const clientIp = requestIp.getClientIp(req);
    const device = await parser(req.headers['user-agent']);

    const checkOrganization = await Organization.findById(organization);

    if (!checkOrganization) {
      return badResponse(res, 'Organization not found');
    }

    const user = await Model.findOne({
      email: email.toLowerCase(),
      organization: checkOrganization.id,
    })
      .select('+password')
      .populate({ path: 'organization' });

    if (!user || !(await user.correctPassword(password, user.password))) {
      return badResponse(res, 'Incorrect credentials');
    }

    if (user.isBlocked) {
      return badResponse(res, 'Account Temporary suspended');
    }

    if (!user.isVerified) {
      const token = jwtToken(user._id);
      const verificationCode = generateCode();
      (await user).verificationCode = verificationCode;
      await user.save({ validateBeforeSave: false });

      const doc = {
        token,
      };

      await new Email(res, user, '', verificationCode).verifyEmail();
      goodResponseDoc(res, 'Verify Account', 401, doc);
    }

    if (user.twoFactor) {
      consoleMessage('2FA mail sent');
      const verificationCode = generateCode();
      const token = jwtToken(user._id);
      user.twoFactorVerificationCode = verificationCode;
      await user.save({ validateBeforeSave: false });
      await new Email(
        res,
        user,
        'Hello there',
        verificationCode
      ).twoFactorLoginUser();
      return goodResponseDoc(
        res,
        'Complete login with the code sent to email',
        200,
        { twoFactor: true, token }
      );
    }
    // TODO: IMPORTANT LINE OF CODE TO BE RESTORED
    if (user.noOfLoggedInDevices < 2) {
      user.noOfLoggedInDevices++;
    } else {
      return goodResponseDoc(
        res,
        'You are logged in two devices, logout out from them to get access to this account',
        400,
        {
          id: user.queryId,
          allDevicesLogged: true,
          loginToken,
        }
      );
    }

    if (user.loginTokens.length > 2) {
      user.loginTokens = [loginToken];
    } else {
      user.loginTokens.push(loginToken);
    }

    user.lastLogin = Date.now();
    user.loginDetails = [{ device, clientIp }];
    await user.save({ validateBeforeSave: false });

    const token = await jwtToken(user._id);
    const doc = {
      user,
      token,
      loginToken,
    };
    req.user = user;
    goodResponseDoc(res, 'You are logged in', 200, doc);
  } catch (error) {
    consoleError(error, 'error');
    next(error);
  }
};

// LOGOUT EVERY DEVICE
exports.logOutAllDevices = (Model) => async (req, res, next) => {
  try {
    const clientIp = requestIp.getClientIp(req);
    const device = await parser(req.headers['user-agent']);
    const { loginToken } = req.body;
    if (!loginToken) {
      return badResponse(res, 'Provide Login token');
    }
    const { id } = req.params;

    if (!id) return badResponse(res, 'Provide user Id');

    const user = await Model.findOne({ queryId: id });

    if (!user) return badResponse(res, 'User does not exist');
    // const checkOrganization = await Organization.findById(organization);

    // Update all devices except the current one with the last IP address to be logged out
    await User.updateMany(
      { queryId: id, 'loginDetails.1': { $ne: clientIp } },
      { $set: { noOfLoggedInDevices: 1, loginTokens: loginToken } }
    );

    // Update the current user's information
    user.noOfLoggedInDevices = 1;
    user.lastLogin = Date.now();
    user.loginDetails = [device, clientIp];
    user.loginTokens = loginToken;
    await user.save({ validateBeforeSave: false });

    const token = await jwtToken(user._id);
    const doc = {
      user,
      token,
    };
    req.user = user;
    goodResponseDoc(res, 'You are logged in', 200, doc);
  } catch (error) {
    next(error);
  }
};

exports.LoginWith2Fa = (Model) => async (req, res, next) => {
  try {
    const loginToken = randomToken();
    const { twoFactorVerificationCode } = req.body;
    const { token } = req.params;
    if (!token) return badResponse(res, 'Provide auth token');
    if (!twoFactorVerificationCode)
      return badResponse(res, 'Provide verification code');
    const decodedToken = await verifyJwt(token);
    const user = await User.findOne({
      _id: decodedToken.id,
      twoFactorVerificationCode,
    });
    if (!user) return badResponse(res, 'Incorrect Verification code');
    if (user.isBlocked)
      return badResponseCustom(
        res,
        404,
        'Blocked',
        'Account has been temporary suspended'
      );

    // TODO: limit number of logins for users
    // *DON'T FORGET
    // !IMPORTANT:: super important

    if (user.noOfLoggedInDevices < 2) {
      user.noOfLoggedInDevices++;
    } else {
      return goodResponseDoc(
        res,
        'You are logged in two devices, logout out from them to get access to this account',
        400,
        {
          id: user.queryId,
          allDevicesLogged: true,
          loginToken,
        }
      );
    }

    const device = await parser(req.headers['user-agent']);
    const clientIp = requestIp.getClientIp(req);
    user.loginDetails = [{ device, clientIp }];
    user.lastLogin = Date.now();
    user.twoFactorVerificationCode = undefined;
    user.verificationCode = undefined;
    await user.save({ validateBeforeSave: false });
    const newToken = await jwtToken(user._id);
    req.user = user;
    goodResponseDoc(res, 'You are logged in', 200, {
      user,
      token: newToken,
      loginToken,
    });
  } catch (error) {
    next(error);
  }
};

// RESEND 2FA CODE
exports.resend2FACode = (Model) => async (req, res, next) => {
  try {
    const { token } = req.params;
    if (!token) return badResponse(res, 'Provide user auth token');
    const decodedToken = await verifyJwt(token);

    const user = await Model.findOne({ _id: decodedToken.id }).populate({
      path: 'organization',
    });
    if (!user) return badResponse(res, 'User does not exist');
    const twoFactorVerificationCode = generateCode();
    user.twoFactorVerificationCode = twoFactorVerificationCode;
    await user.save({ validateBeforeSave: false });
    await new Email(res, user, '', twoFactorVerificationCode).twoFactorLogin();
    goodResponse(res, 'OTP sent to email');
  } catch (error) {
    next(error);
  }
};

// LOGOUT USER ACCOUNT
exports.Logout = async (req, res, next) => {
  try {
    if (!req.user) return badResponse(res, 'User does not exist');
    if (req.user.noOfLoggedInDevices === 1) {
      req.user.noOfLoggedInDevices = 0;
      req.user.save({ validateBeforeSave: false });
    } else if (req.user.noOfLoggedInDevices === 2) {
      req.user.noOfLoggedInDevices = 1;
      req.user.save({ validateBeforeSave: false });
    }

    req.user = undefined;
    goodResponse(res, 'Logged out successfully');
  } catch (error) {
    next(error);
  }
};

// FORGOT PASSWORD
exports.forgetPassword = (Model) => async (req, res) => {
  try {
    const { id } = req.params;
    const { email } = req.body;
    if (!id) return badResponse(res, 'Provide organization Id');
    if (!email) return badResponse(res, 'Please provide an Email');

    const checkOrganization = await Organization.findById(id);

    if (!checkOrganization) {
      return badResponse(res, 'Organization not found');
    }

    const user = await Model.findOne({
      email: email.toLowerCase(),
      organization: checkOrganization.id,
    }).populate({ path: 'organization' });
    if (!user) return badResponse(res, 'Account does not exist');
    const resetToken = await user.createResetToken();

    await user.save({ validateBeforeSave: false });
    const url = `${process.env.WEB_URL}/password_reset/${resetToken}`;
    await new Email(res, user, url).forgetPasswordUser();
    consoleMessage({ resetToken });
    goodResponse(res, 'Password reset Link sent to email');
  } catch (error) {
    consoleError(error);
    badResponse(res, 'Something went wrong');
  }
};

// RESET PASSWORD
exports.resetPassword = (Model) => async (req, res) => {
  try {
    const { password, confirmPassword } = req.body;
    if (!password) {
      return badResponse(res, 'Please Enter new Password');
    } else if (password.length < 8) {
      return badResponse(res, 'Password should be more than 8 characters');
    }
    if (!confirmPassword) return badResponse(res, 'Please confirm password');
    if (password !== confirmPassword)
      return badResponse(res, 'Passwords are incorrect');
    if (!req.params.token) badResponse(res, 'Provide token');

    const hashedToken = await crypto
      .createHash('sha256')
      .update(req.params.token)
      .digest('hex');

    const user = await Model.findOne({
      passwordResetToken: hashedToken,
    });

    if (!user) return badResponse(res, 'Invalid token provided');
    user.password = password;
    user.confirmPassword = undefined;
    user.passwordResetToken = undefined;
    user.passwordResetToken = undefined;
    await user.save({ validateBeforeSave: false });
    goodResponseCustom(res, 201, 'Password updated successfully');
  } catch (error) {
    consoleError(error);
    badResponse(res, 'Could not reset password');
  }
};

// UPDATE PASSWORD
exports.updatePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword, confirmPassword } = req.body;
    const user = req.user;
    if (!user) return badResponse(res, 'User does not exist');
    if (!(await user.correctPassword(currentPassword, user.password))) {
      return badResponse(res, 'Incorrect Password');
    }

    user.password = newPassword;
    user.confirmPassword = confirmPassword;
    user.save();

    goodResponse(res, 'Password Updated!');
  } catch (error) {
    badResponse(res, 'Could not update Password');
    consoleError(error);
  }
};

exports.signInWithGoogle = async (req, res, next) => {
  try {
    const { email, firstName, lastName, image, referralCode } = req.body;
    const loginToken = randomToken();
    if (!email) return badResponse(res, 'Provide email');
    if (!firstName) return badResponse(res, 'First name is required');
    if (!lastName) return badResponse(res, 'last name is required');

    const clientIp = requestIp.getClientIp(req);
    const device = await parser(req.headers['user-agent']);

    const userCheck = await User.findOne({ email });

    if (userCheck) {
      if (userCheck.isBlocked) {
        return badResponse(res, 'Account Temporary suspended');
      }

      userCheck.loginTokens.push(loginToken);
      userCheck.lastLogin = Date.now();
      userCheck.loginDetails = [{ device, clientIp }];
      await userCheck.save({ validateBeforeSave: false });

      const token = await jwtToken(userCheck._id);
      const doc = {
        user: userCheck,
        token,
        loginToken,
      };
      req.user = userCheck;
      goodResponseDoc(res, 'You are logged in', 200, doc);
    } else {
      const password = generateCode();
      const user = await User.create({
        email,
        firstName,
        lastName,
        password,
        confirmPassword: password,
        photo: image,
        isVerified: true,
        subscription: 'un-subscribed',
        subscriptionDuration: freeSubscriptionDays,
        subscriptionExpires: expirationDate.setDate(
          currentTime.getDate() + freeSubscriptionDays
        ),
        subscriptionId: '76ebea32a11f8c92ebacda41',
        signUpMode: 'google',
      });

      const cbt = await CbtUser.create({
        userAccessId: user.id,
        firstName,
        lastName,
        photo: image,
      });

      const token = jwtToken(user._id);
      const verificationCode = generateCode();
      user.cbt = cbt.id;
      (await user).verificationCode = verificationCode;
      // await user.save({ validateBeforeSave: false });

      user.loginTokens.push(loginToken);
      user.lastLogin = Date.now();
      user.loginDetails = [{ device, clientIp }];
      await user.save({ validateBeforeSave: false });
      await new Email(res, user, '', '').welcome();

      if (referralCode) {
        const referral = await Referrals.findOne({ code: referralCode });
        if (referral) {
          referral.usersList.push(user._id);
          await referral.save();
        }
      }

      const doc = {
        user,
        token,
        loginToken,
      };

      goodResponseDoc(res, 'User create successfully', 201, doc);
    }
  } catch (error) {
    if (error.code === 11000) {
      return badResponse(res, 'This email has been used');
    }
    next(error);
  }
};
