const {env} = window;

export default {
  bob: {apiUrl: env.BOB_API_URL},
  disk: {
    namespace: 'bob'
  },
  watch: env.WATCH === '1'
};
