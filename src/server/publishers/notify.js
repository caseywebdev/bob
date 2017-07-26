const {CANCELLED} = require('../../shared/constants/statuses');
const notify = require('../utils/notify');

module.exports = ({build: {id, status}}) =>
  status === CANCELLED && notify({channel: `build:${id}:cancelled`});
