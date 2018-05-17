const crypto = require('crypto');

module.exports = ({algorithm, buffer}) => {
  const hash = crypto.createHash(algorithm);
  hash.update(buffer);
  return hash.digest();
};
