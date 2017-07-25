const {env} = window;

export default {
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
