import _ from 'underscore';
import React from 'react';
import Loading from '../shared/loading';
import ErrorComponent from '../shared/error';

const render = ({
  props: {
    onSave,
    pave: {
      contextPaths: {envEditor: path},
      error,
      isLoading,
      state: {env, newPermission, permissionsByUserId},
      store
    }
  }
}) =>
  isLoading ? <Loading /> :
  error ? <ErrorComponent {...{error}} /> :
  <div>
    <div>Name</div>
    <input
      value={env.name || ''}
      onChange={({target: {value}}) =>
        store.update(toDelta(path, {env: {name: {$set: value}}}))
      }
    />
    <div>Config</div>
    <textarea
      value={env.config || ''}
      onChange={({target: {value}}) =>
        store.update(toDelta(path, {env: {config: {$set: value}}}))
      }
    />
    {
      !permissionsByUserId ? null :
      <div>
        <div>Permissions</div>
        {
          _.map(_.sortBy(permissionsByUserId, 'userId'), ({role, userId}) =>
            <div key={userId}>
              {userId}:
              <select
                onChange={({target: {value}}) =>
                  store.run({query: [
                    'updatePermission!',
                    {
                      envId: env.id,
                      userId,
                      role: parseInt(value)
                    }]}).catch(::console.error)
                }
                value={role}
              >
                <option value={7}>ADMIN</option>
                <option value={3}>WRITE</option>
                <option value={1}>READ</option>
              </select>
            </div>
          )
        }
        <div>
          <input
            value={newPermission && newPermission.userId || ''}
            onChange={({target: {value}}) =>
              store.update(toDelta(path, {newPermission: {userId: {$set: value}}}))
            }
          />
          <select
            onChange={({target: {value}}) =>
              store.update(toDelta(path, {newPermission: {role: {$set: value}}}))
            }
            value={newPermission && newPermission.role || 1}
          >
            <option value={7}>ADMIN</option>
            <option value={3}>WRITE</option>
            <option value={1}>READ</option>
          </select>
          <button
            onClick={() => {
              if (!newPermission) return;

              const {role, userId} = newPermission;
              store.run({query: ['createPermission!', {
                envId: env.id,
                userId,
                role
              }]}).then(() =>
                store.update(toDelta(path, {newPermission: {$unset: true}}))
              ).catch(::console.error);
            }}
          >
            Add Permission
          </button>
        </div>
      </div>
    }
    <button
      onClick={() => {
        let {config, id, name} = env;
        try {
          config = JSON.parse(config);
        } catch (er) {
          return alert('`config` is not valid JSON');
        }

        onSave({id, name, config});
      }}
    >
      Save
    </button>
  </div>;

export default withPave(
  props => render({props}),
  {
    createContextPaths: {envEditor: {prefix: ['ui']}},

    getQuery: ({
      contextPaths: {envEditor: path},
      props: {envId},
      store
    }) => {
      const query = [path];
      const envPath = path.concat('env');
      const env = store.get(envPath);
      const permissionsPath = ['envsById', envId, 'permissionsByUserId'];
      if (envId) query.push(permissionsPath);
      if (!env) {
        if (envId) {
          const savedPath = ['envsById', envId];
          const saved = store.get(savedPath);
          if (saved) {
            const {config, id, name} = saved;
            store.update(toDelta(envPath, {
              $set: _.extend({id, name}, {
                config: JSON.stringify(config, null, 2)
              })
            }));
          } else {
            query.push(savedPath);
          }
        } else {
          store.update(toDelta(envPath, {
            $set: {name: '', config: '{}'}
          }));
        }
      }
      return [query];
    },

    getState: ({contextPaths: {envEditor: path}, props: {envId}, store}) => ({
      env: store.get(path.concat('env')),
      newPermission: store.get(path.concat('newPermission')),
      permissionsByUserId: store.get(['envsById', envId, 'permissionsByUserId'])
    })
  }
);
