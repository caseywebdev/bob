const {env} = window;

export default {
  disk: {
    namespace: 'bob'
  },
  minify: env.MINIFY === '1',
  watch: env.WATCH === '1'
};
