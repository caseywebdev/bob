const {env} = process;

module.exports = {
  postgres: {
    url: {
      value: env.POSTGRES_URL,
      vault: {
        path: env.POSTGRES_URL_VAULT_PATH,
        key: env.POSTGRES_URL_VAULT_KEY
      }
    }
  },
  rootToken: {
    value: env.ROOT_TOKEN,
    vault: {path: env.ROOT_TOKEN_VAULT_PATH, key: env.ROOT_TOKEN_VAULT_KEY}
  },
  vault: {
    auth: {
      data: JSON.parse(env.VAULT_AUTH_DATA || '{}'),
      method: env.VAULT_AUTH_METHOD
    },
    url: env.VAULT_URL
  },
  worker: {
    buildId: parseInt(env.WORKER_BUILD_ID)
  }
};
