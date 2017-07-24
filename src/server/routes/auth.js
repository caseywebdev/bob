const {UNAUTHORIZED} = require('../../shared/constants/errors');
const config = require('../config');
const fetch = require('node-fetch');
const getUser = require('../utils/get-user');
const rootVault = require('../utils/root-vault');

const {clientId, clientSecret} = config.github;

const getClientSecret = async () => {
  const {value, vault: {path, key}} = clientSecret;
  return value || (path && key && (await rootVault.get(path))[key]);
};

module.exports = {
  user: async ({store: {cache: {user}}}) => ({user: {$set: user}}),

  'signIn!.*': async ({1: [auth], store: {cache: {socket}}}) => {
    const user = (socket || {}).user = await getUser({auth});
    return {
      auth: user.id === 'public' ? {$unset: true} : {$set: auth},
      user: {$set: user}
    };
  },

  'signInToken!.$key': async ({1: token, store: {cache: {socket}}}) => {
    const auth = {type: 'token', token};
    return {
      auth: {$set: auth},
      user: {$set: (socket || {}).user = await getUser({auth})}
    };
  },

  'signInGithub!.$key': async ({1: code, store: {cache: {socket}}}) => {
    let token;
    try {
      const res = await fetch(
        'https://github.com/login/oauth/access_token' +
          `?client_id=${clientId}` +
          `&client_secret=${await getClientSecret()}` +
          `&code=${code}`,
        {headers: {Accept: 'application/json'}, method: 'POST'}
      );
      token = (await res.json()).access_token;
    } catch (er) {
      throw UNAUTHORIZED;
    }

    if (!token) throw UNAUTHORIZED;

    const auth = {type: 'github', token};
    return {
      auth: {$set: auth},
      user: {$set: (socket || {}).user = await getUser({auth})}
    };
  },

  'signOut!': async ({store: {cache: {socket}}}) => ({
    auth: {$unset: true},
    user: {$set: (socket || {}).user = await getUser()}
  })
};
