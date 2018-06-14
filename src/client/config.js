const {env} = window;

export default {
  bob: {apiUrl: env.BOB_API_URL},
  disk: {namespace: 'bob'},
  livereload: {url: env.LIVERELOAD_URL}
};
