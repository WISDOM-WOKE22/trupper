const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const crypto = require('crypto');
const bcrypt = require('bcryptjs');

const adminSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      trim: true,
    },
    lastName: {
      type: String,
      trim: true,
    },
    email: {
      type: String,
      unique: true,
      required: true,
    },
    password: {
      type: String,
      // require: true,
    },
    confirmPassword: {
      type: String,
      // required: true,
    },
    subscription: {
      type: String,
      enum: ['free', 'subscribed', 'un-subscribed'],
      default: 'un-subscribed',
    },
    organization: {
      type: Schema.Types.ObjectId,
      ref: 'Organization',
    },
    subscriptionDuration: Number,
    subscriptionExpires: Date,
    subscriptionId: {
      type: Schema.Types.ObjectId,
      ref: 'Subscription',
    },
    mobile: {
      type: String,
    },
    school: String,
    isBlocked: {
      type: Boolean,
      default: false,
    },
    twoFactor: {
      type: Boolean,
      default: false,
    },
    twoFactorVerificationCode: {
      type: Number,
    },
    queryId: String,
    massLogin: {
      type: Boolean,
      default: false,
    },
    noOfLoggedInDevices: {
      type: Number,
      default: 1,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    settings: {
      type: Schema.Types.ObjectId,
      ref: 'Settings',
    },
    verificationCode: Number,
    lastLogin: Date,
    photo: String,
    passwordResetTokenExpires: Date,
    passwordResetToken: String,
    verificationToken: String,
    cbtTrials: {
      type: Number,
      default: 0,
    },
    theme: {
      type: String,
      enum: ['light', 'dark', "system"],
      default: 'light',
    },
    signUpMode: {
      type: String,
      enum: ['normal', 'google'],
      default: 'normal',
    },
    role: {
      type: String,
      enum: ['ADMIN', 'SUB_ADMIN'],
      default: 'ADMIN',
    },
    loginTokens: [
      {
        type: String,
      },
    ],
    loginDetails: [
      {
        type: Array,
      },
    ],
    cbt: String,
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

adminSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    return next();
  }
  this.password = await bcrypt.hash(this.password, 15);
  this.confirmPassword = undefined;
  this.queryId = crypto.randomBytes(20).toString('hex');
  next();
});

adminSchema.methods.correctPassword = async function (
  candidatePassword,
  userPassword
) {
  return await bcrypt.compare(candidatePassword, userPassword);
};

adminSchema.methods.createVerificationToken = async function () {
  const token = crypto.randomBytes(40).toString('hex');
  this.verificationToken = crypto
    .createHash('sha256')
    .update(token)
    .digest('hex');

    return token;
};

adminSchema.methods.createResetToken = async function () {
  const resetToken = crypto.randomBytes(40).toString('hex');
  this.passwordResetToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');

  this.passwordResetTokenExpires = Date.now() + 5 * 60 * 1000;
  return resetToken;
};

const Admin = mongoose.model('Admin', adminSchema);

module.exports = Admin;