const _ = require('underscore');
const getRootUserId = require('./get-root-user-id');
const Octokat = require('octokat');

const PUBLIC_USER = {id: 'public', name: 'Anonymous'};

const fetch = async ({type, token}) => {
  switch (type) {
  case 'token':
    return {id: `token:${token}`, name: 'Token User'};
  case 'github':
    try {
      const github = new Octokat({token});
      const {login, name} = await github.user.fetch();
      return {id: `github:${login}`, name};
    } catch (er) {}
  }

  return PUBLIC_USER;
};

module.exports = async ({auth}) => {
  let user = await fetch(auth || {});
  if (user.id === await getRootUserId()) {
    user = _.extend({}, user, {isRoot: true});
  }
  return user;
};
