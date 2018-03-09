// https://tools.ietf.org/html/rfc4648#section-5
module.exports = buffer =>
  buffer
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');
