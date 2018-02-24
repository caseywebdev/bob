const fetch = require('node-fetch');
const getGithub = require('../functions/get-github');
const getGithubToken = require('../functions/get-github-token');
const TarStripStream = require('../functions/tar-strip-stream');
const zlib = require('zlib');

exports.id = 'github';

exports.getCommitFromWebhook = async ({
  env,
  req: {
    headers: {'x-github-event': event},
    body: {
      after: sha,
      commits: [{message} = {}] = [],
      deleted,
      ref,
      repository: {full_name: repo = ''} = {}
    }
  }
}) => {
  if (event !== 'push' || deleted || !repo || !ref) return;

  return exports.getCommit({env, message, ref: ref.split('/')[2], repo, sha});
};

exports.getCommit = async ({env, message, ref, repo, sha}) => {
  if (message == null || !sha) {
    const github = await getGithub({env});
    const commit = await github.repos(repo).commits(ref).fetch();
    message = commit.message;
    sha = commit.sha;
  }

  return {message, ref, repo, sha};
};

exports.readFile = async ({commit: {repo, sha}, env, filename}) => {
  const github = await getGithub({env});
  try {
    return await github.repos(repo).contents(filename).read({ref: sha});
  } catch (er) {
    if (er.message.endsWith('Status: 404')) return;

    throw er;
  }
};

exports.getTarStream = async ({build: {context, repo, sha}, env}) => {
  const token = await getGithubToken({env});
  const apiUrl = `https://api.github.com/repos/${repo}/tarball/${sha}`;
  const res = await fetch(apiUrl, {headers: {Authorization: `token ${token}`}});
  return res.body
    .pipe(zlib.createGunzip())
    .pipe(new TarStripStream({base: context, strip: 1}));
};
