module.exports = ({build: {id, repo, ref, status, error}}) =>
  console.log(
    `Build #${id} ${repo}#${ref} ${status}${error ? ` - ${error}` : ''}`
  );
