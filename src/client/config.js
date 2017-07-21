const {env} = window;

export default {
  bob: {
    url: env.BOB_URL
  },
  livereload: {
    url: env.LIVERELOAD_URL
  },
  WATCH: env.WATCH === '1'
};
