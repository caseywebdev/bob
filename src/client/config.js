const {env} = window;

export default {
  disk: {
    namespace: 'bob'
  },
  watch: env.WATCH === '1'
};
