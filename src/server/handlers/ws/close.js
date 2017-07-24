const {unlisten} = require('../../utils/db-channels');
const sockets = require('../../utils/sockets');

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
