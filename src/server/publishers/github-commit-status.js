const getBuildDescription = require('../../shared/functions/get-build-description');
const getGithub = require('../functions/get-github');
const STATUSES = require('../../shared/constants/statuses');

const STATUS_STATES = {
  [STATUSES.PENDING]: 'pending',
  [STATUSES.CLAIMED]: 'pending',
  [STATUSES.PULLING]: 'pending',
  [STATUSES.BUILDING]: 'pending',
  [STATUSES.PUSHING]: 'pending',
  [STATUSES.SUCCEEDED]: 'success',
  [STATUSES.CANCELLED]: 'failure',
  [STATUSES.FAILED]: 'failure'
};

module.exports = async ({
  build,
  build: {repo, hash, status, tags},
  env,
  source,
  url
}) => {
  if (source.id !== 'github') return;

  const github = await getGithub({env});
  return github.repos(repo).statuses(hash).create({
    context: tags[0],
    state: STATUS_STATES[status],
    description: getBuildDescription({build}),
    target_url: url
  });
};
