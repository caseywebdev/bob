const sockets = require('../../utils/sockets');
const uuid = require('uuid/v4');

module.exports = ({socket}) => sockets[socket.id = uuid()] = socket;
