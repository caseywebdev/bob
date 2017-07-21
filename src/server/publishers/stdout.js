module.exports = ({build: {repo, ref, status, error}}) =>
  console.log(`${repo}#${ref} ${status}${error ? `: ${error}` : ''}`);
