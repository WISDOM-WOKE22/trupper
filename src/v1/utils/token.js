const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const { promisify } = require("util");

exports.randomToken = () => {
  return crypto.randomBytes(15).toString("hex");
};

exports.jwtToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES,
  });
};

exports.verifyJwt = async (token) => {
  return await promisify(jwt.verify)(token, process.env.JWT_SECRET);
};

exports.generateCode = () => {
  return Math.floor(Math.random() * 100000);
};
