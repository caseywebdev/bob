const Octokat = require('octokat');
const splitAuth = require('./split-auth');

module.exports = async ({auth, socket}) => {
  if (socket.auth) return;

  const [type, token] = splitAuth({auth});
  switch (type) {
  case 'token':
    return socket.auth = `token:${token}`;
  case 'github':
    try {
      const github = new Octokat({token});
      const {login} = await github.user();
      return socket.auth = `github:${login}`;
    } catch (er) {}
  }
};
