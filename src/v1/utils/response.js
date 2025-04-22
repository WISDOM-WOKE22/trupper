exports.goodResponse = (res, message) => {
  return res.status(200).json({
    status: "Success",
    message,
  });
};

exports.goodResponseDoc = (res, message, statusCode, doc) => {
  return res.status(statusCode).json({
    status: "Success",
    message,
    doc,
  });
};

exports.goodResponseCustom = (res, statusCode, message) => {
  return res.status(statusCode).json({
    status: "Success",
    message,
  });
};

exports.goodResponseResult = (res, doc) => {
  return res.status(200).json({
    status: "Success",
    result: doc.length,
    doc,
  });
};

exports.badResponse = (res, message) => {
  return res.status(400).json({
    status: "Failed",
    message,
  });
};

exports.errorResponse = (res, message, statusCode) => {
  return res.status(statusCode).json({
    status: "Error",
    message,
  });
};

exports.badResponseCustom = (res, statusCode, error, message) => {
  return res.json(statusCode).json({
    status: "Failed",
    message,
    error,
  });
};
