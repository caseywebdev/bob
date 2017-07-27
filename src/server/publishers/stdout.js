const getBuildDescription = require('../utils/get-build-description');

module.exports = ({build}) =>
  console.log(getBuildDescription({build, withError: true}));
