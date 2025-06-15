exports.goodResponse = (res, message) => {
  return res.status(200).json({
    status: 200,
    statusType: 'Success',
    message,
  });
};

exports.goodResponseDoc = (res, message, statusCode, doc) => {
  return res.status(statusCode).json({
    status: statusCode,
    statusType: 'Success',
    message,
    doc,
  });
};

exports.goodResponseCustom = (res, statusCode, message) => {
  return res.status(statusCode).json({
    status: 'Success',
    message,
  });
};

exports.goodResponseResult = (res, doc) => {
  return res.status(200).json({
    status: 'Success',
    result: doc.length,
    doc,
  });
};

exports.badResponse = (res, message) => {
  return res.status(400).json({
    status: 400,
    statusType: 'Failed',
    message,
  });
};

exports.errorResponse = (res, message, statusCode) => {
  return res.status(statusCode).json({
    status: 400,
    statusType: 'Error',
    message,
  });
};

exports.badResponseCustom = (res, statusCode, error, message) => {
  return res.json(statusCode).json({
    status: statusCode,
    statusType: 'Failed',
    message,
    error,
  });
};
