const {UNAUTHORIZED} = require('../../shared/constants/errors');
const config = require('../config');
const fetch = require('node-fetch');
const rootVault = require('../utils/root-vault');

const {clientId, clientSecret} = config.github;

const getClientSecret = async () => {
  const {value, vault: {path, key}} = clientSecret;
  return value || (path && key && (await rootVault.get(path))[key]);
};

module.exports = {
  'authGithub!.$key': async ({1: code}) => {
    try {
      const res = await fetch(
        'https://github.com/login/oauth/access_token' +
          `?client_id=${clientId}` +
          `&client_secret=${await getClientSecret()}` +
          `&code=${code}`,
        {headers: {Accept: 'application/json'}, method: 'POST'}
      );
      const {access_token: token} = await res.json();
      if (!token) throw UNAUTHORIZED;

      return {auth: {$set: {type: 'github', token}}};
    } catch (er) {
      throw UNAUTHORIZED;
    }
  }
};
