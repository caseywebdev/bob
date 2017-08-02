const {env} = window;

export default {
  disk: {
    namespace: 'bob'
  },
  github: {
    clientId: env.GITHUB_CLIENT_ID
  },
  watch: env.WATCH === '1'
};
