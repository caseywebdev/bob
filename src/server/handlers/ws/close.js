const sockets = require('../../utils/sockets');

module.exports = ({socket}) => delete sockets[socket.id];
