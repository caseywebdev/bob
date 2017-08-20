const fetch = require('node-fetch');
const getGithub = require('../utils/get-github');
const getGithubToken = require('../utils/get-github-token');
const TarStripStream = require('../utils/tar-strip-stream');
const zlib = require('zlib');

exports.id = 'github';

exports.getCommitFromWebhook = async ({
  env,
  req: {
    headers: {'x-github-event': event},
    body: {
      after: sha,
      deleted,
      ref,
      repository: {full_name: repo = ''} = {}
    }
  }
}) => {
  if (event !== 'push' || deleted || !repo || !ref) return;

  return exports.getCommit({env, ref: ref.split('/')[2], repo, sha});
};

exports.getCommit = async ({env, ref, repo, sha}) => {
  const github = await getGithub({env});
  if (!sha) sha = (await github.repos(repo).commits().fetch({sha: ref})).sha;
  return {ref, repo, sha};
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
  const res = await fetch(`${apiUrl}?access_token=${token}`);
  return res.body
    .pipe(zlib.createGunzip())
    .pipe(new TarStripStream({base: context, strip: 1}));
};
