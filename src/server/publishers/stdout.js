const getBuildDescription = require('../../shared/utils/get-build-description');

module.exports = ({build}) =>
  console.log(getBuildDescription({build, withError: true}));
