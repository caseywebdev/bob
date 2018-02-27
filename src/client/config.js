const {env} = window;

export default {
  disk: {
    namespace: 'bob'
  },
  github: {
    clientId: env.GITHUB_CLIENT_ID
  },
  minify: env.MINIFY === '1',
  watch: env.WATCH === '1'
};
