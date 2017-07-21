const {env} = process;

module.exports = {
  bob: {
    url: env.BOB_URL
  },
  github: {
    clientId: {
      value: env.GITHUB_CLIENT_ID,
      vault: {
        path: env.GITHUB_CLIENT_ID_VAULT_PATH,
        key: env.GITHUB_CLIENT_ID_VAULT_KEY
      }
    },
    clientSecret: {
      value: env.GITHUB_CLIENT_SECRET,
      vault: {
        path: env.GITHUB_CLIENT_SECRET_VAULT_PATH,
        key: env.GITHUB_CLIENT_SECRET_VAULT_KEY
      }
    }
  },
  postgres: {
    url: {
      value: env.POSTGRES_URL,
      vault: {
        path: env.POSTGRES_URL_VAULT_PATH,
        key: env.POSTGRES_URL_VAULT_KEY
      }
    }
  },
  rootUserId: {
    value: env.ROOT_USER_ID,
    vault: {path: env.ROOT_USER_ID_VAULT_PATH, key: env.ROOT_USER_ID_VAULT_KEY}
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
