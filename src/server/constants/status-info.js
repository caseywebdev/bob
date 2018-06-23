const COLORS = require('./colors');
const STATUSES = require('./statuses');

module.exports = {
  [STATUSES.PENDING]: {color: COLORS.YELLOW, emoji: '🕐'},
  [STATUSES.CLAIMED]: {color: COLORS.ORANGE, emoji: '💼'},
  [STATUSES.PULLING]: {color: COLORS.TEAL_BLUE, emoji: '⬇️'},
  [STATUSES.BUILDING]: {color: COLORS.BLUE, emoji: '🛠'},
  [STATUSES.PUSHING]: {color: COLORS.PURPLE, emoji: '⬆️'},
  [STATUSES.SUCCEEDED]: {color: COLORS.GREEN, emoji: '✅'},
  [STATUSES.CANCELLED]: {color: COLORS.LIGHT_GRAY, emoji: '🚫'},
  [STATUSES.FAILED]: {color: COLORS.RED, emoji: '❌'}
};
