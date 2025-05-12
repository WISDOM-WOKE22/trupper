const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const { promisify } = require('util');

exports.randomToken = () => {
  return crypto.randomBytes(15).toString('hex');
};

exports.jwtToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_ACCESS_SECRET, {
    expiresIn: process.env.JWT_EXPIRES,
  });
};

exports.generateRefreshToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_REFRESH_TOKEN);
};

exports.multiplePayLoadJwtToken = (payload) => {
  console.log(payload);
  return jwt.sign(payload, process.env.JWT_ACCESS_SECRET, {
    expiresIn: process.env.JWT_EXPIRES,
  });
};

exports.verifyJwt = async (token) => {
  return await promisify(jwt.verify)(token, process.env.JWT_ACCESS_SECRET);
};

exports.generateCode = () => {
  return Math.floor(100000 + Math.random() * 900000);
}

