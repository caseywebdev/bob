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
      after: hash,
      commits: [{message} = {}] = [],
      deleted,
      ref,
      repository: {full_name: repo = ''} = {}
    }
  }
}) => {
  if (event !== 'push' || deleted || !repo || !ref) return;

  return exports.getCommit({env, hash, message, ref: ref.split('/')[2], repo});
};

exports.getCommit = async ({env, hash, message, ref, repo}) => {
  if (!hash || message == null) {
    const github = await getGithub({env});
    const commit = await github.repos(repo).commits(hash || ref).fetch();
    message = commit.message;
    hash = commit.sha;
  }

  return {message, ref, repo, hash};
};

exports.readFile = async ({commit: {repo, hash}, env, filename}) => {
  const github = await getGithub({env});
  try {
    return await github.repos(repo).contents(filename).read({ref: hash});
  } catch (er) {
    if (er.message.endsWith('Status: 404')) return;

    throw er;
  }
};

exports.getTarStream = async ({build: {context, hash, repo}, env}) => {
  const token = await getGithubToken({env});
  const apiUrl = `https://api.github.com/repos/${repo}/tarball/${hash}`;
  const res = await fetch(apiUrl, {headers: {Authorization: `token ${token}`}});
  return res.body
    .pipe(zlib.createGunzip())
    .pipe(new TarStripStream({base: context, strip: 1}));
};
