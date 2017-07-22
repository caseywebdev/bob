const {env} = window;

export default {
  bob: {
    url: env.BOB_URL
  },
  disk: {
    namespace: 'bob'
  },
  github: {
    clientId: env.GITHUB_CLIENT_ID
  },
  livereload: {
    url: env.LIVERELOAD_URL
  },
  WATCH: env.WATCH === '1'
};
