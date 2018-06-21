const fetch = require('node-fetch');
const getHash = require('./get-hash');

module.exports = async ({emailAddress}) => {
  try {
    const hash = await getHash({algorithm: 'md5', buffer: emailAddress});
    const hex = hash.toString('hex');
    const url = `https://secure.gravatar.com/${hex}.json`;
    const res = await fetch(url);
    const data = await res.json();

    const {
      displayName = '',
      name: {familyName = '', formatted = '', givenName = ''}
    } = data.entry[0];

    const name = (
      displayName ||
      formatted ||
      `${givenName} ${familyName}`
    ).trim();

    if (name) return name;
  } catch (er) {}

  return emailAddress.slice(0, emailAddress.lastIndexOf('@'));
};
