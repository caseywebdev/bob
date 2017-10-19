const {unlisten} = require('../../functions/db-channels');
const sockets = require('../../functions/sockets');

module.exports = async ({socket}) => {
  const {id, listeners} = socket;
  delete sockets[id];
  for (let key in listeners) {
    try {
      await unlisten(key, listeners[key]);
    } catch (er) {
      console.error(er);
    }
  }
};
