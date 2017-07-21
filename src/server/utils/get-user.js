const Octokat = require('octokat');

const PUBLIC_USER = {id: 'public', name: 'Anonymous'};

module.exports = async ({auth: {type, token} = {}}) => {
  switch (type) {
  case 'token':
    return {id: `token:${token}`, name: 'Token User'};
  case 'github':
    try {
      const github = new Octokat({token});
      const {login, name} = await github.user().fetch();
      return {id: `github:${login}`, name};
    } catch (er) {}
  }

  return PUBLIC_USER;
};
