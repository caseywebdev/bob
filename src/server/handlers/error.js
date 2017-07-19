const http = require('http');

module.exports = (er, req, res, next) => {
  if (res.headersSent) return next(er);

  let {message, statusCode} = er;
  if (!statusCode) {
    message = '';
    statusCode = 500;
  }
  if (statusCode >= 500) console.error(er);
  res
    .status(statusCode)
    .send(message || http.STATUS_CODES[statusCode] || 'Unknown Error');
};
