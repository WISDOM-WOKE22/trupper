exports.consoleError = (error) => {
  if (process.env.NODE_ENV === 'development') {
    console.log(error);
  }
};

exports.consoleMessage = (message) => {
  if (process.env.NODE_ENV === 'development') {
    console.log(message);
  }
};
