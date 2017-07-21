const COLORS = require('./colors');
const STATUSES = require('./statuses');

module.exports = {
  [STATUSES.PENDING]: {color: COLORS.YELLOW, emojiShortname: 'clock1'},
  [STATUSES.CLAIMED]: {color: COLORS.ORANGE, emojiShortname: 'briefcase'},
  [STATUSES.PULLING]: {color: COLORS.TEAL_BLUE, emojiShortname: 'arrow_down'},
  [STATUSES.BUILDING]: {color: COLORS.BLUE, emojiShortname: 'hammer_and_wrench'},
  [STATUSES.PUSHING]: {color: COLORS.PURPLE, emojiShortname: 'up_arrow'},
  [STATUSES.SUCCEEDED]: {color: COLORS.GREEN, emojiShortname: 'white_check_mark'},
  [STATUSES.CANCELLED]: {color: COLORS.LIGHT_GRAY, emojiShortname: 'no_entry_sign'},
  [STATUSES.FAILED]: {color: COLORS.RED, emojiShortname: 'x'}
};
