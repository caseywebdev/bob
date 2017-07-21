const {env} = process;

module.exports = {
  bob: {
    url: env.BOB_URL
  },
  docker: {
    socketPath: env.DOCKER_SOCKET_PATH,
    protocol: env.DOCKER_PROTOCOL,
    host: env.DOCKER_HOST,
    port: parseInt(env.DOCKER_PORT),
    ca: {
      value: env.DOCKER_CA,
      vault: {path: env.DOCKER_CA_VAULT_PATH, key: env.DOCKER_CA_VAULT_KEY}
    },
    cert: {
      value: env.DOCKER_CERT,
      vault: {path: env.DOCKER_CERT_VAULT_PATH, key: env.DOCKER_CERT_VAULT_KEY}
    },
    key: {
      value: env.DOCKER_KEY,
      vault: {path: env.DOCKER_KEY_VAULT_PATH, key: env.DOCKER_KEY_VAULT_KEY}
    }
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
