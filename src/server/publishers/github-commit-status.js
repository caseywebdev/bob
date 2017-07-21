const getGithub = require('../utils/get-github');
const STATUSES = require('../../shared/constants/statuses');
const STATUS_INFO = require('../../shared/constants/status-info');

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
  build: {repo, sha, status, tags},
  env,
  source,
  url
}) => {
  if (source.id !== 'github') return;

  const github = await getGithub({env});
  return github.repos(repo).statuses(sha).create({
    context: tags[0],
    state: STATUS_STATES[status],
    description: `:${STATUS_INFO[status].emojiShortname}: ${status}`,
    target_url: url
  });
};
