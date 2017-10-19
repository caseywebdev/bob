const sockets = require('../../functions/sockets');
const uuid = require('uuid/v4');

module.exports = ({socket}) => sockets[socket.id = uuid()] = socket;
