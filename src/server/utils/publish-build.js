module.exports = async ({build: {repo, ref, status, error}}) => {
  console.log('Publish this:', repo, ref, status, error);
};
