const crypto = require('crypto');

const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

const generateCode = (length = 8) => {
  const charLength = chars.length;
  const bytes = new Uint8Array(length);
  crypto.getRandomValues(bytes); // Faster than Math.random()
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars[bytes[i] % charLength];
  }
  return result;
};

exports.generateCode = generateCode;

exports.generateUniqueCodes = (count, length = 8) => {
  const codes = new Set();
  const maxAttempts = count * 2; // Prevent infinite loops
  let attempts = 0;

  while (codes.size < count && attempts < maxAttempts) {
    codes.add(generateCode(length));
    attempts++;
  }

  if (codes.size < count) {
    throw new Error('Unable to generate enough unique codes');
  }

  return Array.from(codes);
};
