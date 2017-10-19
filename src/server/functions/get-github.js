const getGithubToken = require('./get-github-token');
const Octokat = require('octokat');

module.exports = async ({env}) =>
  new Octokat({token: await getGithubToken({env})});
